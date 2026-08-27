# Sparkquill

Interactive practice in reading and mathematics for Florida students in grades 1
through 6, built on the B.E.S.T. standards and aimed at the FAST assessments.

Production: https://sparkquill.ptosperollc.com

## What this is

Most test-prep for Florida is a worksheet on a screen. Sparkquill teaches the
same standards through manipulatives a child can pick up and turn — a solid that
rotates under the finger and counts its own faces, base-ten blocks that regroup
with an animation, phoneme tiles that speak when you slide them together — and
wraps them in an adaptive engine that keeps each child at roughly a 75% success
rate.

Every question has audio, which is what makes the platform usable at all for a
first or second grader who cannot yet read fluently.

## Two products under one name

This shapes almost every decision in the codebase, so it is worth stating early:

| Grades | Assessment | Reporting | Achievement level prediction |
| ------ | ---------- | --------- | ---------------------------- |
| 1–2 | Renaissance Star (Early Literacy, Reading, Math) | Percentile and skill domains | **No** — no published benchmark blueprint exists |
| 3–6 | FAST (Cambium) ELA Reading and Mathematics | Reporting categories with published weights, achievement levels 1–5 | Yes, with a confidence interval |

`hasBlueprint(grade)` in `src/lib/utils.ts` is the guard for this. Anything that
predicts a level must check it first — inventing a FAST score for a second
grader would be dishonest, not merely inaccurate.

## Curriculum data

The full inventory lives in version control as the source of truth:

- `docs/benchmarks-math.csv` — 202 benchmarks, grades 1–6
- `docs/benchmarks-ela.csv` — 156 benchmarks, grades 1–6

Both carry the official code, strand, description and — where Florida publishes
a blueprint — the reporting category. The benchmark code (`MA.5.GR.3.2`) is the
primary key throughout the database, not a descriptive field.

Validate them without a database:

```bash
npm run curriculum:check
```

This checks every code against its own columns, rejects duplicates, and fails if
a reporting category in the CSV has drifted from the blueprint weights table.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and AUTH_SECRET
npm run db:push              # create the schema
npm run db:seed              # load the 358 benchmarks
npm run dev
```

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |
| `npm run curriculum:check` | Validate the benchmark CSVs (no database needed) |
| `npm run db:push` | Push the Drizzle schema |
| `npm run db:seed` | Seed strands, reporting categories and benchmarks |
| `npm run db:studio` | Drizzle Studio |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Postgres with
Drizzle · Auth.js v5 · Stripe Billing · react-three-fiber for the 3D
manipulatives · dnd-kit for accessible drag and drop.

## Privacy posture

Children do not have accounts. A parent signs up, and each child gets a profile
with a first name, a grade and a hashed PIN — no surname, no email, no school,
no full date of birth, no photo, no biometrics. Voice input, where it exists, is
processed on-device and never transmitted.

The parent's card transaction doubles as verifiable parental consent under
COPPA, which is one of the methods the rule accepts explicitly.

## Planning

The full development plan, including the research behind the curriculum data and
the assessment structure, is in `docs/plan.html`.

## Trademarks

Sparkquill is an independent study tool, not affiliated with, sponsored by, or
endorsed by the Florida Department of Education or Cambium Assessment. "FAST"
and "B.E.S.T." are designations of the State of Florida, used here only
descriptively.
