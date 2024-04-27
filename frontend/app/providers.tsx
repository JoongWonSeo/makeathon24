"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SessionProvider } from "ws-sync";
import { useIsClient } from "@uidotdev/usehooks";
import { toast } from "sonner";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const isClient = useIsClient();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        {isClient ? (
          <SessionProvider
            url={`ws://${window.location.hostname}:9000/ws`}
            label="Server"
            toast={toast}
            autoconnect
            wsAuth
          >
            {children}
          </SessionProvider>
        ) : (
          children
        )}
      </NextThemesProvider>
    </NextUIProvider>
  );
}
