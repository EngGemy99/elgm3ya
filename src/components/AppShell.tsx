import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-frame has-[.welcome-screen]:bg-[#071526]">
      <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page shadow-xl has-[.welcome-screen]:bg-transparent has-[.welcome-screen]:shadow-none">
        {children}
      </div>
    </div>
  );
}
