"use client";

import { useEffect } from "react";

export function HashScroll() {
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;

    const id = hash.slice(1);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return null;
}
