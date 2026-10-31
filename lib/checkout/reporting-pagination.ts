// A gateway/database can enforce a smaller page size than the requested limit.
// Only an empty page proves exhaustion. Never return a silently partial report.
export async function readReportingPages<T>(read: (offset: number) => Promise<T[]>) {
  const rows: T[] = [];
  for (let page = 0; page < 200; page += 1) {
    const batch = await read(rows.length);
    if (!Array.isArray(batch)) throw new Error("Invalid reporting page");
    if (batch.length === 0) return rows;
    rows.push(...batch);
  }
  throw new Error("Reporting pagination exceeded the safety limit");
}
