"use client";

import * as React from "react";

interface CircularProgressProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  colorVariant?: "purple" | "cyan" | "blue" | "amber" | "rose";
  className?: string;
  showPercent?: boolean;
}

export function CircularProgress({
  value,
  size = 72,
  strokeWidth = 6,
  colorVariant = "purple",
  className = "",
  showPercent = true,
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const colorConfig = {
    purple: {
      gradientId: "grad-purple",
      startColor: "#ec4899",
      stopColor: "#a855f7",
      glowClass: "progress-ring-glow-purple",
      textClass: "text-purple-400 dark:text-purple-300",
      trackColor: "rgba(168, 85, 247, 0.15)",
    },
    cyan: {
      gradientId: "grad-cyan",
      startColor: "#06b6d4",
      stopColor: "#10b981",
      glowClass: "progress-ring-glow-cyan",
      textClass: "text-cyan-400 dark:text-cyan-300",
      trackColor: "rgba(6, 182, 212, 0.15)",
    },
    blue: {
      gradientId: "grad-blue",
      startColor: "#3b82f6",
      stopColor: "#6366f1",
      glowClass: "progress-ring-glow-blue",
      textClass: "text-blue-400 dark:text-blue-300",
      trackColor: "rgba(59, 130, 246, 0.15)",
    },
    amber: {
      gradientId: "grad-amber",
      startColor: "#f59e0b",
      stopColor: "#ea580c",
      glowClass: "progress-ring-glow-amber",
      textClass: "text-amber-400 dark:text-amber-300",
      trackColor: "rgba(245, 158, 11, 0.15)",
    },
    rose: {
      gradientId: "grad-rose",
      startColor: "#f43f5e",
      stopColor: "#fb7185",
      glowClass: "progress-ring-glow-purple",
      textClass: "text-rose-400 dark:text-rose-300",
      trackColor: "rgba(244, 63, 94, 0.15)",
    },
  };

  const cfg = colorConfig[colorVariant] || colorConfig.purple;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={`transform -rotate-90 ${cfg.glowClass}`}>
        <defs>
          <linearGradient id={cfg.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.startColor} />
            <stop offset="100%" stopColor={cfg.stopColor} />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={cfg.trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Fill Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${cfg.gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Percentage Center Text */}
      {showPercent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`font-bold font-mono tracking-tight text-xs sm:text-sm ${cfg.textClass}`}>
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
    </div>
  );
}
