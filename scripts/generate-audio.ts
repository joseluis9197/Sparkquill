import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { PASSAGES } from "../src/lib/passages";

/**
 * Builds narration clips for the passages.
 *
 * Only the passages. Questions are generated from a seed and are effectively
 * infinite, so there is nothing to record — those are read by the device's
 * own synthesiser, and always will be. Passages are a fixed set, they are
 * the longest thing a child has to listen to, and they are where a good
 * voice makes the difference between a tool a struggling reader can use and
 * one they cannot.
 *
 * ## Providers
 *
 * Two, chosen by what is configured:
 *
 *   TTS_PROVIDER=openai   with OPENAI_API_KEY
 *   TTS_PROVIDER=piper    with PIPER_BIN and PIPER_MODEL (local, free, offline)
 *
 * Neither is required for the platform to work. With no provider configured
 * this script reports what it would build and exits, and the app narrates
 * everything on-device exactly as it does today.
 *
 * ## Naming
 *
 * A clip is named by the hash of the text it contains, not by the passage id.
 * Editing a passage therefore produces a new filename rather than a stale
 * clip that no longer matches the words on the screen — the failure mode
 * where a child hears one sentence and reads another.
 */

const OUT_DIR = join("public", "audio", "passages");

export function clipName(text: string): string {
  return `${createHash("sha256").update(text).digest("hex").slice(0, 16)}.mp3`;
}

type Provider = (text: string) => Promise<Buffer>;

function openaiProvider(): Provider {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("TTS_PROVIDER=openai needs OPENAI_API_KEY");
  const voice = process.env.TTS_VOICE ?? "alloy";

  return async (text) => {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.TTS_MODEL ?? "gpt-4o-mini-tts",
        voice,
        input: text,
        // Slower than conversational. These are children reading along.
        speed: 0.9,
      }),
    });
    if (!res.ok) {
      throw new Error(`TTS failed (${res.status}): ${await res.text()}`);
    }
    return Buffer.from(await res.arrayBuffer());
  };
}

function piperProvider(): Provider {
  const bin = process.env.PIPER_BIN;
  const model = process.env.PIPER_MODEL;
  if (!bin || !model) {
    throw new Error("TTS_PROVIDER=piper needs PIPER_BIN and PIPER_MODEL");
  }
  return async (text) => {
    // Piper writes WAV; ffmpeg converts it. Both must be on PATH.
    const wav = join(OUT_DIR, ".tmp.wav");
    execFileSync(bin, ["--model", model, "--output_file", wav], { input: text });
    const mp3 = join(OUT_DIR, ".tmp.mp3");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, mp3]);
    const buf = readFileSync(mp3);
    unlinkSync(wav);
    unlinkSync(mp3);
    return buf;
  };
}

function chooseProvider(): Provider | null {
  switch (process.env.TTS_PROVIDER) {
    case "openai":
      return openaiProvider();
    case "piper":
      return piperProvider();
    default:
      return null;
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const prune = process.argv.includes("--prune");

  mkdirSync(OUT_DIR, { recursive: true });
  const wanted = new Map(PASSAGES.map((p) => [clipName(p.text), p]));

  const provider = chooseProvider();
  if (!provider) {
    console.log(
      `No TTS provider configured (set TTS_PROVIDER=openai or piper).\n` +
        `${wanted.size} passages would need clips. The app narrates on-device meanwhile.`,
    );
    const present = existsSync(OUT_DIR)
      ? readdirSync(OUT_DIR).filter((f) => f.endsWith(".mp3"))
      : [];
    console.log(`${present.length} clips already built.`);
    return;
  }

  let built = 0;
  let skipped = 0;
  for (const [name, passage] of wanted) {
    const path = join(OUT_DIR, name);
    if (!force && existsSync(path)) {
      skipped++;
      continue;
    }
    process.stdout.write(`  ${passage.id} … `);
    const audio = await provider(passage.text);
    writeFileSync(path, audio);
    built++;
    console.log(`${(audio.length / 1024).toFixed(0)} KB`);
  }

  console.log(`\nBuilt ${built}, already present ${skipped}.`);

  if (prune) {
    // Clips whose text has changed are orphaned by the content hash. They are
    // removed only when asked, because deleting audio nobody can regenerate
    // without an API key is not something to do by default.
    const orphans = readdirSync(OUT_DIR).filter(
      (f) => f.endsWith(".mp3") && !wanted.has(f),
    );
    for (const f of orphans) unlinkSync(join(OUT_DIR, f));
    if (orphans.length) console.log(`Pruned ${orphans.length} stale clips.`);
  }
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
