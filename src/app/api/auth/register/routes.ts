

export default async function POST(req: Request) {
    return new Response(
        JSON.stringify({ message: "Register endpoint is under construction" }),
        { status: 501, headers: { "Content-Type": "application/json" } }
    );
}