#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, appendFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * The Postgres the integration tests run against.
 *
 * A cluster of its own, living in `.postgres/` inside the repository, started
 * on demand and never installed system-wide. It exists because the developer
 * database on this project is reached through an SSH tunnel to the production
 * server, and a test harness that truncates tables must not be able to reach
 * that machine even by accident. A separate cluster on a different port makes
 * that a fact about the world rather than a promise in a comment.
 *
 * Nothing here is a service. It starts when asked, stops when asked, and its
 * data directory is disposable — `stop --wipe` and re-running is always safe.
 *
 * Durability is deliberately switched off in postgresql.conf: fsync and
 * synchronous_commit cost real time on a suite that rebuilds its schema every
 * run, and the only data at risk is data the next run would delete anyway.
 */

const ROOT = resolve(import.meta.dirname, "..");
const PG = join(ROOT, ".postgres", "pgsql", "bin");
const DATA = join(ROOT, ".postgres", "data");
const LOG = join(ROOT, ".postgres", "server.log");
const PORT = 5434;

function exe(name) {
  return join(PG, process.platform === "win32" ? `${name}.exe` : name);
}

function run(name, args, opts = {}) {
  return spawnSync(exe(name), args, { stdio: "pipe", encoding: "utf8", ...opts });
}

function isRunning() {
  const r = run("pg_isready", ["-h", "127.0.0.1", "-p", String(PORT), "-q"]);
  return r.status === 0;
}

function requireBinaries() {
  if (existsSync(exe("pg_ctl"))) return;
  console.error(
    `No Postgres binaries in ${PG}.\n\n` +
      `This project keeps a disposable cluster inside the repository rather\n` +
      `than installing one. To create it, download the official Windows\n` +
      `binaries zip from EnterpriseDB (the distributor postgresql.org links\n` +
      `to for Windows), unzip it so that ${PG} exists, then run:\n\n` +
      `  node scripts/test-db.mjs init\n`,
  );
  process.exit(1);
}

function init() {
  requireBinaries();
  if (existsSync(join(DATA, "PG_VERSION"))) {
    console.log("Data directory already initialised.");
    return;
  }
  const r = run("initdb", [
    "-D", DATA,
    "-U", "postgres",
    "--auth-host=trust",
    "--auth-local=trust",
    "--encoding=UTF8",
    "--locale=C",
  ]);
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(1);
  }
  // Bound to loopback, off the tunnel's port, and with durability disabled.
  appendFileSync(
    join(DATA, "postgresql.conf"),
    [
      "",
      "# Written by scripts/test-db.mjs — a disposable test cluster.",
      "listen_addresses = '127.0.0.1'",
      `port = ${PORT}`,
      "fsync = off",
      "synchronous_commit = off",
      "full_page_writes = off",
      "max_connections = 30",
      "",
    ].join("\n"),
  );
  console.log(`Initialised ${DATA}.`);
}

function start() {
  requireBinaries();
  if (isRunning()) {
    console.log(`Already listening on 127.0.0.1:${PORT}.`);
    return;
  }
  init();
  // -w waits until it is actually accepting connections, so a caller that
  // returns from here can connect immediately rather than racing the server.
  const r = run("pg_ctl", ["-D", DATA, "-l", LOG, "-w", "-t", "60", "start"]);
  if (!isRunning()) {
    console.error(r.stdout || r.stderr || "pg_ctl start failed.");
    process.exit(1);
  }
  console.log(`Listening on 127.0.0.1:${PORT}.`);
}

function stop() {
  if (!existsSync(exe("pg_ctl")) || !isRunning()) {
    console.log("Not running.");
    return;
  }
  run("pg_ctl", ["-D", DATA, "-m", "fast", "-w", "stop"]);
  console.log("Stopped.");
}

const command = process.argv[2] ?? "start";
if (command === "start") start();
else if (command === "stop") stop();
else if (command === "init") init();
else if (command === "status") {
  console.log(isRunning() ? `Listening on 127.0.0.1:${PORT}.` : "Not running.");
} else {
  console.error(`Unknown command "${command}". Use start, stop, init or status.`);
  process.exit(1);
}
