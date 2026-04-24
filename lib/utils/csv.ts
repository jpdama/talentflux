export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const stringValue = String(value ?? "");
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replaceAll('"', '""')}"`;
    }
    return stringValue;
  };

  return [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join(
    "\n"
  );
}
