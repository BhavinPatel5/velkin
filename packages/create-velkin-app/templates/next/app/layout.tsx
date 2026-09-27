import type { ReactNode } from "react";
import { VuThemeHead, htmlThemeProps } from "@velkin/react/theme-head";
import { VuThemeProvider } from "@velkin/react/theme-provider";
import "./globals.css";

export const metadata = {
  title: "Velkin app",
  description: "Scaffolded with create-velkin-app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...htmlThemeProps} suppressHydrationWarning>
      <head>
        <VuThemeHead />
      </head>
      <body>
        <VuThemeProvider persist>{children}</VuThemeProvider>
      </body>
    </html>
  );
}
