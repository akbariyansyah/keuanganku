
export default function Footer() {
  return (
    <footer className="w-full border-t bg-white text-center p-4">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Keuanganku. All rights reserved.
      </p>
    </footer>
  );
}