import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  real,
  primaryKey,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ *
 * Enums
 * ------------------------------------------------------------------ */

export const subjectEnum = pgEnum("subject", ["math", "ela"]);

/**
 * How a session was run.
 *
 * Kept apart because the two answer different questions. Practice is adaptive
 * and forgiving: it repeats what a child is weak at, gives hints, and says
 * whether each answer was right straight away. A mock test is none of those
 * things, and its score is the only number in the product that can be
 * compared to a real test. Averaging the two together would flatter the mock
 * and corrupt the practice record at once.
 */
export const sessionModeEnum = pgEnum("session_mode", ["practice", "mock"]);

/** Mirrors the item types actually used on FAST. See docs/plan.html §01. */
export const itemTypeEnum = pgEnum("item_type", [
  "multiple_choice",
  "multiselect",
  "editing_task_choice",
  "hot_text",
  "table_match",
  "equation_editor",
  "grid_drag",
  "fraction_model",
  "graphing",
  "ebsr",
  "widget", // answered through an interactive manipulative
]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "in_review",
  "published",
  "retired",
]);

export const masteryLevelEnum = pgEnum("mastery_level", [
  "not_started",
  "learning",
  "practicing",
  "mastered",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);

export const adminRoleEnum = pgEnum("admin_role", [
  "support", // read-only + impersonate
  "content", // + content review queue
  "owner", // + billing and admin management
]);

/* ------------------------------------------------------------------ *
 * Curriculum — changes roughly once a year
 * ------------------------------------------------------------------ */

/**
 * A B.E.S.T. strand, e.g. MA.2.NSO or ELA.2.R.
 * `code` is the official prefix and doubles as the natural key.
 */
export const strands = pgTable(
  "strands",
  {
    code: text("code").primaryKey(), // "MA.2.NSO"
    subject: subjectEnum("subject").notNull(),
    grade: integer("grade").notNull(),
    key: text("key").notNull(), // "NSO"
    name: text("name").notNull(), // "Number Sense and Operations"
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("strands_subject_grade_idx").on(t.subject, t.grade)],
);

/**
 * The atom of the curriculum. `code` is the official Florida benchmark
 * identifier (MA.5.GR.3.2) and is the primary key on purpose: every item,
 * report and prediction hangs off it. When Florida revises the standards we
 * version this table, we never renumber rows.
 */
export const benchmarks = pgTable(
  "benchmarks",
  {
    code: text("code").primaryKey(),
    subject: subjectEnum("subject").notNull(),
    grade: integer("grade").notNull(),
    strandCode: text("strand_code")
      .notNull()
      .references(() => strands.code),
    standard: integer("standard").notNull(), // the 4th segment
    description: text("description").notNull(),
    /**
     * Reporting category from the FDOE test blueprint, or null when the
     * benchmark is not assessed (grades 1-2 have no blueprint at all, and
     * only ~half of each ELA grade appears on FAST ELA Reading).
     */
    reportingCategory: text("reporting_category"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    index("benchmarks_subject_grade_idx").on(t.subject, t.grade),
    index("benchmarks_strand_idx").on(t.strandCode),
    index("benchmarks_reporting_category_idx").on(t.reportingCategory),
  ],
);

/**
 * Weight of each reporting category on the real test, per grade+subject.
 * Drives how the adaptive engine prioritises by impact on the actual score.
 */
export const reportingCategories = pgTable(
  "reporting_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subject: subjectEnum("subject").notNull(),
    grade: integer("grade").notNull(),
    name: text("name").notNull(),
    weightMin: real("weight_min").notNull(), // 0.23
    weightMax: real("weight_max").notNull(), // 0.29
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    uniqueIndex("reporting_categories_unique").on(t.subject, t.grade, t.name),
  ],
);

/**
 * A teachable sub-unit of a benchmark and the unit of mastery.
 * One benchmark yields one or more skills.
 */
export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(), // "place-value-3-digit-compose"
    benchmarkCode: text("benchmark_code")
      .notNull()
      .references(() => benchmarks.code),
    title: text("title").notNull(),
    description: text("description"),
    /** Baseline difficulty on the Elo scale, used before calibration. */
    baseDifficulty: real("base_difficulty").notNull().default(1000),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("skills_benchmark_idx").on(t.benchmarkCode)],
);

/**
 * Directed prerequisite graph. Deliberately allows cross-grade edges: a
 * struggling 2nd grader often needs a 1st grade skill, and without this the
 * platform can only re-serve the exact item the child already failed.
 */
export const skillPrerequisites = pgTable(
  "skill_prerequisites",
  {
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    prerequisiteId: uuid("prerequisite_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    /** How strongly the prerequisite gates the skill (0-1). */
    strength: real("strength").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.skillId, t.prerequisiteId] })],
);

/* ------------------------------------------------------------------ *
 * Content — changes daily
 * ------------------------------------------------------------------ */

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: jsonb("body").notNull(), // structured blocks, not raw HTML
    widgetKey: text("widget_key"), // manipulative shown in `explore` mode
    widgetConfig: jsonb("widget_config"),
    audioUrl: text("audio_url"),
    status: contentStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("lessons_skill_idx").on(t.skillId)],
);

/** Reading passages for ELA, with the complexity metrics we validate against. */
export const passages = pgTable(
  "passages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    grade: integer("grade").notNull(),
    genre: text("genre").notNull(), // "narrative_fiction" | "exposition" | ...
    isInformational: boolean("is_informational").notNull(),
    wordCount: integer("word_count").notNull(),
    lexile: integer("lexile"),
    /** Word-level timings for read-along, generated with the audio. */
    audioUrl: text("audio_url"),
    audioTimings: jsonb("audio_timings"),
    sourceNote: text("source_note"), // provenance: original or public domain
    status: contentStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("passages_grade_idx").on(t.grade)],
);

/**
 * A parametric generator (math) or a static item definition (ELA).
 * `generatorKey` points at a TypeScript generator; when null the template
 * carries its own fixed stem and options.
 */
export const itemTemplates = pgTable(
  "item_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    passageId: uuid("passage_id").references(() => passages.id),
    itemType: itemTypeEnum("item_type").notNull(),
    generatorKey: text("generator_key"),
    /** Fixed content for non-generated items. */
    payload: jsonb("payload"),
    widgetKey: text("widget_key"),
    difficulty: real("difficulty").notNull().default(1000),
    status: contentStatusEnum("status").notNull().default("draft"),
    /* Post-hoc psychometrics, recomputed by a scheduled job. */
    pValue: real("p_value"),
    pointBiserial: real("point_biserial"),
    attemptCount: integer("attempt_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("item_templates_skill_idx").on(t.skillId),
    index("item_templates_status_idx").on(t.status),
  ],
);

/**
 * A materialised instance of a template. Storing the seed and the resolved
 * params makes every attempt reproducible, which matters for support ("show
 * me exactly what my child saw") and for psychometrics.
 */
export const items = pgTable(
  "items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => itemTemplates.id, { onDelete: "cascade" }),
    seed: integer("seed").notNull(),
    resolved: jsonb("resolved").notNull(), // full rendered item payload
    answerKey: jsonb("answer_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("items_template_seed_unique").on(t.templateId, t.seed)],
);

/** Human review queue. Nothing reaches a child without passing through here. */
export const contentReviews = pgTable("content_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").references(() => itemTemplates.id, {
    onDelete: "cascade",
  }),
  passageId: uuid("passage_id").references(() => passages.id, {
    onDelete: "cascade",
  }),
  reviewerId: uuid("reviewer_id").references(() => adminUsers.id),
  decision: text("decision"), // "approved" | "rejected" | "changes_requested"
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ *
 * Accounts — one event at a time
 * ------------------------------------------------------------------ */

/** The parent. The only account type that has an email address. */
export const parents = pgTable("parents", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  name: text("name"),
  passwordHash: text("password_hash"),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  /**
   * Free access granted by staff: beta families, a school trying it out, or
   * making good after something went wrong.
   *
   * Always dated rather than a boolean. Free access with no end quietly
   * accumulates until nobody knows who is paying and who is not, and the
   * reason is stored because "why does this family not pay" is a question
   * somebody will ask a year from now.
   */
  complimentaryUntil: timestamp("complimentary_until", { withTimezone: true }),
  complimentaryReason: text("complimentary_reason"),
  /** Parent-configurable: daily practice goal in minutes. */
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(15),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * The child. Deliberately minimal: first name, grade, birth year, hashed PIN.
 * No surname, no school, no address, no photo, no full date of birth, no
 * biometrics. See docs/plan.html §09 — this shape is what makes the COPPA
 * position defensible rather than a policy document that hopes for the best.
 */
export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => parents.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    grade: integer("grade").notNull(),
    birthYear: integer("birth_year"),
    avatarKey: text("avatar_key").notNull().default("fox"),
    pinHash: text("pin_hash").notNull(),
    /** Audio autoplay preference, set by the parent. */
    autoplayAudio: boolean("autoplay_audio").notNull().default(true),
    /**
     * A strand the parent has asked practice to lean towards, and when that
     * ends. Both null when there is no focus.
     *
     * Stored as the full strand code ("MA.4.FR") rather than the key ("FR"),
     * so it carries its own subject and grade and cannot quietly match the
     * wrong thing after a birthday.
     *
     * Deliberately expiring. A focus that never ended would be a topic menu
     * with extra steps, and the reason to have it is a test on Thursday.
     */
    focusStrand: text("focus_strand"),
    focusUntil: timestamp("focus_until", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("students_parent_idx").on(t.parentId)],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => parents.id, { onDelete: "cascade" }),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    stripePriceId: text("stripe_price_id").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    /** Number of seats paid for; equals the number of assignable students. */
    seatQuantity: integer("seat_quantity").notNull().default(1),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end")
      .notNull()
      .default(false),
    trialEnd: timestamp("trial_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("subscriptions_parent_idx").on(t.parentId)],
);

/**
 * Assignment of a student to a paid seat. Releasing a seat does not delete
 * the student or their progress — a lapsed card must never destroy a child's
 * history.
 */
export const studentSeats = pgTable(
  "student_seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    releasedAt: timestamp("released_at", { withTimezone: true }),
  },
  (t) => [
    index("student_seats_subscription_idx").on(t.subscriptionId),
    index("student_seats_student_idx").on(t.studentId),
  ],
);

/** Webhook idempotency. Stripe redelivers; without this, seats double up. */
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(), // Stripe event.id
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  payload: jsonb("payload"),
});

/**
 * Password reset tokens.
 *
 * The token is stored as a SHA-256 hash, never in the clear: a leaked database
 * would otherwise hand over working reset links for every pending request.
 * Single use, short-lived, and superseded whenever a newer one is issued for
 * the same address.
 */
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => parents.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("password_reset_parent_idx").on(t.parentId),
    index("password_reset_expires_idx").on(t.expiresAt),
  ],
);

/**
 * Failed-attempt counter for anything guessable.
 *
 * A four-digit PIN has ten thousand possibilities, and a password has however
 * many the parent chose. Neither is safe without a limit on how fast they can
 * be tried, and this table is the limit — there is no Redis on the box, and a
 * counter that survives a restart is better than one that does not.
 *
 * `key` is scoped by kind, e.g. `login:parent@example.com` or `pin:<uuid>`.
 */
export const authThrottle = pgTable(
  "auth_throttle",
  {
    key: text("key").primaryKey(),
    failures: integer("failures").notNull().default(0),
    /** Nothing is accepted for this key until this moment passes. */
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    firstFailureAt: timestamp("first_failure_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("auth_throttle_updated_idx").on(t.updatedAt)],
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("support"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Every admin action touching an account, a subscription or a child's data.
 * This is the first thing a school district asks for in a privacy review.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => adminUsers.id),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(), // "subscription.seats_changed"
    targetType: text("target_type").notNull(), // "student" | "subscription"
    targetId: text("target_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_log_target_idx").on(t.targetType, t.targetId),
    index("audit_log_created_idx").on(t.createdAt),
  ],
);

/* ------------------------------------------------------------------ *
 * Progress — every second
 * ------------------------------------------------------------------ */

export const practiceSessions = pgTable(
  "practice_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    subject: subjectEnum("subject").notNull(),
    mode: sessionModeEnum("mode").notNull().default("practice"),
    /**
     * Seed for a mock test's question list.
     *
     * Stored so a reload, a lost connection or a closed tab returns the same
     * paper rather than a fresh one. A test you can reroll by refreshing is
     * not a test.
     */
    paperSeed: integer("paper_seed"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    itemsAttempted: integer("items_attempted").notNull().default(0),
    itemsCorrect: integer("items_correct").notNull().default(0),
    sparksEarned: integer("sparks_earned").notNull().default(0),
  },
  (t) => [index("practice_sessions_student_idx").on(t.studentId)],
);

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => practiceSessions.id, {
      onDelete: "set null",
    }),
    /**
     * Items are generated, not stored: a template key plus a seed reproduces
     * the exact question byte for byte. Recording those two is enough to
     * replay what the child saw, which is why there is no foreign key to a
     * row in `items` here — that table is for the static ELA bank.
     */
    templateKey: text("template_key").notNull(),
    seed: integer("seed").notNull(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    response: jsonb("response").notNull(),
    correct: boolean("correct").notNull(),
    /** Which catalogued misconception the chosen distractor maps to. */
    misconception: text("misconception"),
    /**
     * Difficulty of the item as served, kept so mastery can be recomputed
     * later without re-deriving it — the rule only counts attempts at or
     * above grade level, so this number is part of the evidence.
     */
    itemDifficulty: real("item_difficulty").notNull().default(1000),
    timeMs: integer("time_ms").notNull(),
    hintsUsed: integer("hints_used").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("attempts_student_idx").on(t.studentId),
    index("attempts_skill_idx").on(t.studentId, t.skillId),
    index("attempts_created_idx").on(t.createdAt),
  ],
);

export const skillMastery = pgTable(
  "skill_mastery",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    /** Student's Elo rating for this skill. */
    rating: real("rating").notNull().default(1000),
    level: masteryLevelEnum("level").notNull().default("not_started"),
    /** Rolling window used for the 4-of-5 mastery rule. */
    recentResults: jsonb("recent_results").notNull().default([]),
    attemptCount: integer("attempt_count").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    /** Spaced repetition: 1d, 3d, 7d, 21d. */
    reviewStage: integer("review_stage").notNull().default(0),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.studentId, t.skillId] }),
    index("skill_mastery_review_idx").on(t.studentId, t.nextReviewAt),
  ],
);

/* ------------------------------------------------------------------ *
 * Auth.js adapter tables
 * ------------------------------------------------------------------ */

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => parents.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => parents.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
