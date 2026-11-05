"use client";

import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

// Manually installed shadcn/ui Sonner adapter; theme follows the shared shell.
export function Toaster(props: ToasterProps) {
  return <Sonner className="toaster group" position="top-right" richColors closeButton duration={4500} {...props} />;
}
