

export default function Unauthorized() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-6xl font-bold mb-4">401</h1>
            <p className="text-xl text-muted-foreground">Unauthorized Access</p>
            <a href="/login">
                Go to Login
            </a>
        </div>
    )
}