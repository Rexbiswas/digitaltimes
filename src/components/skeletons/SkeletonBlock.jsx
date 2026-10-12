"use client";

import React from "react";

export default function SkeletonBlock({
  className = "",
  style = {},
  width,
  height,
  circle = false,
  rounded = "rounded-xs",
  as: Component = "div",
  ...props
}) {
  const shapeClass = circle ? "rounded-full aspect-square" : rounded;

  return (
    <Component
      role="status"
      aria-hidden="true"
      className={`vintage-skeleton-surface select-none pointer-events-none ${shapeClass} ${className}`}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        ...style,
      }}
      {...props}
    />
  );
}
