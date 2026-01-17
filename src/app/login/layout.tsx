export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* 👇 Ini layout khusus login, tanpa header/nav */}
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
