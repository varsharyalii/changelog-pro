/**
 * Basic Jest tests for Changelog Pro
 */

describe("Changelog Pro", () => {
  test("module can be imported", () => {
    const { ChangelogService, generate, getStats } = require("../index");

    expect(typeof ChangelogService).toBe("function");
    expect(typeof generate).toBe("function");
    expect(typeof getStats).toBe("function");
  });

  test("ChangelogService can be instantiated", () => {
    const { ChangelogService } = require("../index");
    const service = new ChangelogService({ config: {} });

    expect(service).toBeInstanceOf(ChangelogService);
  });

  test("HTML renderer exists", () => {
    const { HtmlRenderer } = require("../lib/html-renderer");

    expect(typeof HtmlRenderer).toBe("function");
  });
});
