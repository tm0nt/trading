"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glareEffect?: boolean;
  tiltEffect?: boolean;
  floatEffect?: boolean;
  glowEffect?: boolean;
  intensity?: "subtle" | "medium" | "strong";
}

export function AnimatedCard({
  children,
  className,
  glareEffect = true,
  tiltEffect = true,
  floatEffect = true,
  glowEffect = true,
  intensity = "medium",
  ...props
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Intensity multipliers
  const intensityValues = {
    subtle: 0.5,
    medium: 1,
    strong: 1.5,
  };

  const intensityMultiplier = intensityValues[intensity];

  // Handle mouse movement for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !tiltEffect) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Calculate rotation values (max 10 degrees)
    const rotateY = (x / (rect.width / 2)) * 5 * intensityMultiplier;
    const rotateX = -(y / (rect.height / 2)) * 5 * intensityMultiplier;

    setPosition({ x: rotateY, y: rotateX });

    // Calculate glare position
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY });
  };

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Set hovered state when mouse enters
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Apply floating animation
  useEffect(() => {
    if (!floatEffect || !cardRef.current) return;

    const floatAnimation = () => {
      if (!cardRef.current || !isHovered) return;

      // Apply subtle floating effect when hovered
      const floatY = Math.sin(Date.now() / 1000) * 3 * intensityMultiplier;
      cardRef.current.style.transform = `
        perspective(1000px) 
        rotateX(${position.y}deg) 
        rotateY(${position.x}deg) 
        translateZ(0) 
        translateY(${isHovered ? floatY : 0}px)
      `;
    };

    const animationFrame = requestAnimationFrame(function animate() {
      floatAnimation();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [floatEffect, isHovered, position, intensityMultiplier]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-lg transition-all duration-200",
        {
          "transform-gpu": tiltEffect || floatEffect,
          "hover:shadow-xl": glowEffect,
          "dark:hover:shadow-primary/20": glowEffect,
        },
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform: `perspective(1000px) rotateX(${position.y}deg) rotateY(${position.x}deg) translateZ(0)`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      {...props}
    >
      {children}

      {/* Glare effect */}
      {glareEffect && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 bg-gradient-radial from-white/20 to-transparent"
          style={{
            opacity: isHovered ? 0.15 * intensityMultiplier : 0,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)`,
          }}
        />
      )}
    </div>
  );
}
