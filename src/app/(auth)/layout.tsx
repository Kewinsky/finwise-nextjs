export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-blue-950/20 dark:to-purple-950/20" />

      {/* Animated gradient orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in-0 zoom-in-95 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
