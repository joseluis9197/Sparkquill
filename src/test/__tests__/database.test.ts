import { describe, expect, it } from "vitest";
import { assertDisposable, databaseName, maintenanceUrl } from "../database";

/**
 * The guard that stands between the integration suite and real data.
 *
 * This runs in the ordinary unit suite rather than the integration one, on
 * purpose: it is a pure function, and the whole reason it exists is to be
 * checked without a database anywhere near it.
 *
 * The stakes are specific to this project. The development database is
 * reached through an SSH tunnel to the machine running production, so an
 * environment variable pointing one character wrong is not an inconvenience —
 * the harness truncates tables.
 */
describe("the disposability guard", () => {
  it("accepts a database whose name says it is disposable", () => {
    expect(() =>
      assertDisposable("postgresql://postgres@127.0.0.1:5434/sparkquill_test"),
    ).not.toThrow();
  });

  it("refuses the production database", () => {
    expect(() =>
      assertDisposable("postgresql://app@127.0.0.1:5432/sparkquill"),
    ).toThrow(/must end in/i);
  });

  it("refuses the development database", () => {
    // The one that is actually a tunnel to the production server.
    expect(() =>
      assertDisposable("postgresql://app@127.0.0.1:5433/sparkquill_dev"),
    ).toThrow(/must end in/i);
  });

  it("is not fooled by a name that merely contains the word", () => {
    expect(() =>
      assertDisposable("postgresql://app@127.0.0.1:5432/test_sparkquill"),
    ).toThrow();
    expect(() =>
      assertDisposable("postgresql://app@127.0.0.1:5432/sparkquill_testing"),
    ).toThrow();
  });

  it("refuses a URL that names no database at all", () => {
    expect(() => assertDisposable("postgresql://app@127.0.0.1:5432/")).toThrow();
    expect(() => assertDisposable("not a url")).toThrow();
  });

  it("keeps the query string out of the name", () => {
    expect(
      databaseName("postgresql://a@h:5434/sparkquill_test?sslmode=disable"),
    ).toBe("sparkquill_test");
  });

  it("points maintenance work at the postgres database, not the test one", () => {
    // CREATE DATABASE cannot run from inside the database being created.
    expect(maintenanceUrl("postgresql://a@h:5434/sparkquill_test")).toContain(
      "/postgres",
    );
  });
});
