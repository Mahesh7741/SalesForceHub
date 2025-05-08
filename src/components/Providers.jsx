'use client';

import { ThemeProvider } from "./theme-provider";
import SessionWrapper from "./SessionWrapper";

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionWrapper>{children}</SessionWrapper>
    </ThemeProvider>
  );
}
