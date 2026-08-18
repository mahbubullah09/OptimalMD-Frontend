"use client";

import { createContext, useContext } from "react";
import type { Breakpoint } from "@/lib/markerParser";

/**
 * Which device the preview is currently showing.
 *
 * Text sizes are per-breakpoint, and the rule authors asked for is that a size
 * chosen while looking at Tablet applies to tablets alone. Rather than adding
 * a second device switch inside every editor, the size controls follow the one
 * already in the workspace toolbar — so what you change is always what you are
 * looking at.
 *
 * Defaults to "desktop" for editors rendered outside a workspace.
 */
const DeviceContext = createContext<Breakpoint>("desktop");

export const DeviceProvider = DeviceContext.Provider;

export const usePreviewDevice = (): Breakpoint => useContext(DeviceContext);
