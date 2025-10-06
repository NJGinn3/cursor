"use client";

import { useEffect } from "react";

export default function SocketInit() {
  useEffect(() => {
    // Touch the socket init endpoint once per app load
    fetch("/api/socket").catch(() => void 0);
  }, []);
  return null;
}
