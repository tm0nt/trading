"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (pathname !== displayChildren.props.pathname) {
      setTransitionStage("fadeOut");
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage("fadeIn");
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [pathname, children, displayChildren.props.pathname]);

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        transitionStage === "fadeIn" ? "opacity-100" : "opacity-0"
      }`}
    >
      {displayChildren}
    </div>
  );
}
