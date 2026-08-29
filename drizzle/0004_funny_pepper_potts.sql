CREATE TYPE "public"."session_mode" AS ENUM('practice', 'mock');--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "mode" "session_mode" DEFAULT 'practice' NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "paper_seed" integer;