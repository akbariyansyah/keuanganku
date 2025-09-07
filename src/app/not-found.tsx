

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl text-muted-foreground">Page Not Found</p>
            <a href="/dashboard">
                Go back home
            </a>
        </div>
    )
}