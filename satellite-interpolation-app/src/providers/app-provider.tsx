'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
