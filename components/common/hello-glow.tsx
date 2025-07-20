"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HelloGlowProps {
  className?: string;
  spanCount?: number;
  children?: ReactNode;
}

export function HelloGlow({
  className,
  spanCount = 25,
  // spanCount = 100,
  children,
}: HelloGlowProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <motion.div
        className={cn(
          "hello transition-all min-w-full !min-h-125",
          className
        )}
        style={{ "--span-count": spanCount } as React.CSSProperties}
        // whileHover={{ scale: 1.01 }}
        // whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isMounted && (
          <>
            {Array.from({ length: spanCount }).map((_, i) => (
              <span
                key={i}
                className={i === 0 ? "start" : i === spanCount - 1 ? "end" : ""}
                style={{ "--i": i + 1 } as React.CSSProperties}
              />
            ))}
          </>
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}
