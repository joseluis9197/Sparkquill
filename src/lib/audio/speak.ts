"use client";

/**
 * Audio playback for narration.
 *
 * Production audio is pre-generated at build time and served as MP3 from the
 * CDN, which keeps the marginal cost per child at zero and the latency at
 * whatever the CDN gives us. The Web Speech fallback exists so a missing clip
 * never leaves a dead speaker button in front of a six-year-old who cannot
 * read the question without it.
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

/** Plays a pre-generated clip, falling back to on-device synthesis. */
export async function speak(
  text: string,
  options: { clipUrl?: string; rate?: number } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  stopSpeech();

  if (options.clipUrl) {
    try {
      const audio = new Audio(options.clipUrl);
      currentAudio = audio;
      await audio.play();
      return;
    } catch {
      // Fall through to synthesis rather than failing silently.
    }
  }

  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
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
