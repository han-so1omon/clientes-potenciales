import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("parses simple rows with CRLF or LF", () => {
    expect(parseCsv("a,b\r\n1,2\n3,4")).toEqual([
      ["a", "b"],
      ["1", "2"],
      ["3", "4"],
    ]);
  });

  it("handles quotes, escaped quotes, commas and newlines inside quotes", () => {
    expect(parseCsv('name,notes\n"Lee, Ann","said ""hi""\nthen left"')).toEqual([
      ["name", "notes"],
      ["Lee, Ann", 'said "hi"\nthen left'],
    ]);
  });

  it("skips blank lines, keeps empty cells, strips a BOM", () => {
    expect(parseCsv("﻿a,b\n\n,2\n")).toEqual([
      ["a", "b"],
      ["", "2"],
    ]);
  });
});
