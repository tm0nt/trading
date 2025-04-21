"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  formatValue,
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  // Format the value (default is to add commas for thousands)
  const format =
    formatValue ||
    ((val: number) => {
      return val.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    });

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;

    // Cancel any existing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Animate the counter
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smoother animation
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      const easedProgress = easeOutQuart(progress);

      // Calculate the current value
      const currentValue =
        startValueRef.current + (value - startValueRef.current) * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums transition-colors", className)}>
      {format(displayValue)}
    </span>
  );
}
