import type { ReactNode } from "react";

type PageTransitionShellProps = {
  children: ReactNode;
};

export function PageTransitionShell({ children }: PageTransitionShellProps) {
  return <>{children}</>;
}
