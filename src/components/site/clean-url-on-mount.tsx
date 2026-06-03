"use client";

import { useEffect } from "react";

export function CleanUrlOnMount() {
  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  }, []);

  return null;
}
