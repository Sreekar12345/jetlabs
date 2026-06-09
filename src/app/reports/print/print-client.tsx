"use client";

import { useEffect } from "react";

export function PrintClient() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
