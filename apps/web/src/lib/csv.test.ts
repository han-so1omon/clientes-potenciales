import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes cells with commas, quotes, and newlines", () => {
    expect(
      toCsv(
        ["a", "b"],
        [
          ["x,y", 'say "hi"'],
          ["line\nbreak", "plain"],
        ],
      ),
    ).toBe('a,b\r\n"x,y","say ""hi"""\r\n"line\nbreak",plain\r\n');
  });

  it("neutralizes spreadsheet formulas", () => {
    expect(toCsv(["a"], [['=HYPERLINK("x")'], ["@SUM(A1)"], ["-1+2"]])).toBe(
      'a\r\n"\'=HYPERLINK(""x"")"\r\n\'@SUM(A1)\r\n\'-1+2\r\n',
    );
  });

  it("keeps E.164 phone numbers intact", () => {
    expect(toCsv(["phone"], [["+13055551234"]])).toBe("phone\r\n+13055551234\r\n");
  });
});
