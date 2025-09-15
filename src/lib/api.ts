
export async function login(data: { email: string; password: string }) {
    const email = data.email;
    const password = data.password;
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res;

}

export async function fetchReportSummary() {
    const res = await fetch("/api/report/summary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return res;
}

export default async function fetchReport() {
  const res = await fetch(`/api/report`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  const json = (await res.json()) as ReportSummaryResponse;
  return json.data;
}
