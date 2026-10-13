import { PROSPECT_CSV_COLUMNS } from "@cp/core";
import { isAdmin } from "@/lib/adminSession";
import { toCsv } from "@/lib/csv";

export async function GET(): Promise<Response> {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const csv = toCsv(
    [...PROSPECT_CSV_COLUMNS],
    [
      [
        "Ana Ruiz",
        "Ruiz Insurance Agency",
        "agency",
        "ana@example.com",
        "(305) 555-2100",
        "https://example.com",
        "Miami",
        "FL",
        "FL;GA",
        "long_term_care;critical_illness",
        "en;es",
        "1234567",
        "FL DFS licensee search",
        "Met at senior expo",
      ],
    ],
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="prospects-template.csv"',
    },
  });
}
