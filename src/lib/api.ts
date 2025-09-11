
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

export async function fetchSummary() {
    const res = await fetch("/api/report/summary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return res;
}