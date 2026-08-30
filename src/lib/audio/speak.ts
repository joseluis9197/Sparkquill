"use client";

/**
 * Narration.
 *
 * Two sources, chosen by what the text is:
 *
 *   - **Passages** are a fixed, finite set, changing only when somebody
 *     writes a new one. They are narrated from pre-generated
 *     clips when those have been built (see `scripts/generate-audio.ts`).
 *   - **Questions** are generated from a seed and are effectively infinite.
 *     There is no clip to make. They are read by the device's own speech
 *     synthesis.
 *
 * That split is a property of the product, not a shortcut. A question whose
 * numbers are chosen at random cannot have a recorded reading, and pretending
 * otherwise would mean either a tiny fixed question bank or silence.
 *
 * Where a clip exists it is preferred, because on-device voices vary from
 * good to genuinely unhelpful depending on the phone, and a six-year-old who
 * needs the narrator to access the text at all should not be at the mercy of
 * which tablet the family owns.
 */

let currentAudio: HTMLAudioElement | null = null;

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * The best available English voice on this device.
 *
 * Voice choice makes more difference than anything else here. Most platforms
 * ship both a compact voice and a much better one, and the default is
 * frequently the compact one — which is where the robotic reading a parent
 * complains about comes from.
 *
 * Preference order: an explicitly enhanced or neural voice, then a named
 * voice known to be good, then any local voice, then whatever exists. Local
 * matters because a network voice stops working on a bad connection, which is
 * exactly when a child is least able to wait.
 */
let cachedVoice: SpeechSynthesisVoice | null | undefined;

const GOOD_NAMES = [
  "samantha", // macOS and iOS, and by some distance the best default anywhere
  "google us english",
  "google uk english female",
  "microsoft aria",
  "microsoft jenny",
  "microsoft zira",
];

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // not loaded yet; do not cache

  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;

  const score = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    let s = 0;
    if (/enhanced|premium|neural|natural/.test(name)) s += 100;
    const known = GOOD_NAMES.findIndex((n) => name.includes(n));
    if (known >= 0) s += 50 - known;
    if (v.localService) s += 10;
    if (v.default) s += 1;
    // Compact voices are the small, buzzy ones. Actively avoided.
    if (name.includes("compact")) s -= 60;
    return s;
  };

  cachedVoice = [...pool].sort((a, b) => score(b) - score(a))[0] ?? null;
  return cachedVoice;
}

/**
 * Voices load asynchronously on most browsers, and `getVoices()` returns an
 * empty list until they do. Without this, the first thing a child taps is
 * read in the default voice and everything afterwards in the good one.
 */
function whenVoicesReady(): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve();
  }
  if (window.speechSynthesis.getVoices().length > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    // Some browsers never fire the event. Waiting for ever would leave the
    // speaker button doing nothing at all, which is worse than a poor voice.
    setTimeout(done, 1200);
  });
}

/**
 * Prepares text for a synthesiser.
 *
 * Two problems, both of which make a question unintelligible when read aloud
 * rather than merely awkward:
 *
 *   - Markdown emphasis is read out as the word "asterisk" by several
 *     engines, in the middle of the number the emphasis was marking.
 *   - Mathematical symbols are skipped silently by most voices, so
 *     "12 ÷ 4" is read as "twelve four" — which is not the question.
 */
function forSpeech(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\s*×\s*/g, " times ")
    .replace(/\s*÷\s*/g, " divided by ")
    .replace(/\s*−\s*/g, " minus ")
    .replace(/\s*≥\s*/g, " is greater than or equal to ")
    .replace(/\s*≤\s*/g, " is less than or equal to ")
    .replace(/\s*≠\s*/g, " is not equal to ")
    .replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2")
    .replace(/°/g, " degrees")
    .replace(/¢/g, " cents")
    // The whole amount, not the first digit: an earlier version read "$14"
    // as "one dollars four".
    .replace(/\$(\d+(?:\.\d+)?)/g, "$1 dollars")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * How long a clip gets to start before we give up and speak instead.
 *
 * A child who has tapped the speaker is waiting in silence, and cannot tell
 * a slow clip from a broken button. Rather more than a good connection needs
 * and rather less than a child will sit through.
 */
const CLIP_START_TIMEOUT_MS = 1200;

/**
 * Starts a clip, reporting whether it actually began playing.
 *
 * Written as a race rather than `await audio.play()` because that promise is
 * not trustworthy. Measured in Chrome against a URL that 404s: `play()`
 * neither resolves nor rejects, no `error` event fires, and the element sits
 * at networkState 2 indefinitely. The previous code awaited that promise
 * inside a try/catch, so the catch never ran and the fallback never happened
 * — the passage read-aloud button was silent for the whole life of the
 * feature.
 *
 * So nothing here waits on a single signal. Success is `playing` actually
 * firing; failure is an error, a rejection, or simply time passing.
 */
async function playClip(url: string): Promise<boolean> {
  const audio = new Audio(url);

  const started = new Promise<boolean>((resolve) => {
    audio.addEventListener("playing", () => resolve(true), { once: true });
    audio.addEventListener("error", () => resolve(false), { once: true });
    audio.play().then(undefined, () => resolve(false));
  });
  const timedOut = new Promise<boolean>((resolve) =>
    setTimeout(() => resolve(false), CLIP_START_TIMEOUT_MS),
  );

  if (await Promise.race([started, timedOut])) {
    currentAudio = audio;
    return true;
  }

  // Stop it loading. Left alone, a stalled request stays open behind a child
  // who has already been given the synthesised reading instead, and would
  // start playing over the top of it if it ever arrived.
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  return false;
}

/** Plays a pre-generated clip if one exists, otherwise synthesises. */
export async function speak(
  text: string,
  options: { clipUrl?: string; rate?: number } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  stopSpeech();

  if (options.clipUrl && (await playClip(options.clipUrl))) return;
  // Anything else falls through to synthesis. A missing or unplayable clip
  // must never leave a dead speaker button in front of a child who cannot
  // read the question without it.

  if (!("speechSynthesis" in window)) return;
  await whenVoicesReady();

  const utterance = new SpeechSynthesisUtterance(forSpeech(text));
  const voice = pickVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  // Slower than default: these are early readers, and the narrator is often
  // the only way they can access the question at all.
  utterance.rate = options.rate ?? 0.92;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

/** True when the browser can narrate at all, used to hide dead controls. */
export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Exported for testing: the transformation applied before synthesis. */
export { forSpeech };
