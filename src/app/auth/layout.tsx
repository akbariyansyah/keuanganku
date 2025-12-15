// Server Component
import '@/app/globals.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nested layout: do NOT include <html>/<body> here; root layout handles that.
  return children;
}
