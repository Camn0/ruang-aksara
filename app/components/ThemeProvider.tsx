/**
 * @file ThemeProvider.tsx
 * @description Global Context provider guaranteeing HSL token persistence between Light/Dark/Magical Journal themes.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
