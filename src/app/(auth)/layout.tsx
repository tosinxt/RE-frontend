export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/30">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
