"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type PageTransitionShellProps = {
  children: React.ReactNode;
};

export function PageTransitionShell({ children }: PageTransitionShellProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);

    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [pathname]);

  return (
    <div className="route-shell">
      <div key={pathname ?? "/"} className={isVisible ? "route-stage route-stage-active" : "route-stage"}>
        {children}
      </div>
    </div>
  );
}
