import { isLine } from "@cp/core";
import { en } from "./messages/en";

/** English labels for admin screens. */
export function lineTitle(line: string): string {
  return isLine(line) ? en.lines[line].title : line;
}

export function interestLabel(line: string, interest: string): string {
  return (isLine(line) ? en.lines[line].options[interest] : undefined) ?? interest;
}
