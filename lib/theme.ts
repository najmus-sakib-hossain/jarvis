import { create } from "@/lib/store";
import * as React from "react";

export interface ValueObject {
    [themeName: string]: string;
}

export type DataAttribute = `data-${string}`;

export interface ScriptProps
    extends React.DetailedHTMLProps<
        React.ScriptHTMLAttributes<HTMLScriptElement>,
        HTMLScriptElement
    > {
    [dataAttribute: DataAttribute]: any;
}

export interface UseThemeProps {
    themes: string[];
    forcedTheme?: string | undefined;
    setTheme: (theme: string) => void;
    theme?: string | undefined;
    resolvedTheme?: string | undefined;
    systemTheme?: "dark" | "light" | undefined;
}

export type Attribute = DataAttribute | "class";

export interface DXProps extends React.PropsWithChildren<unknown> {
    themes?: string[] | undefined;
    forcedTheme?: string | undefined;
    enableSystem?: boolean | undefined;
    disableTransitionOnChange?: boolean | undefined;
    enableColorScheme?: boolean | undefined;
    storageKey?: string | undefined;
    defaultTheme?: string | undefined;
    attribute?: Attribute | Attribute[] | undefined;
    value?: ValueObject | undefined;
    nonce?: string;
    scriptProps?: ScriptProps;
}

export const script = (
    attribute: Attribute | Attribute[],
    storageKey: string,
    defaultTheme: string,
    forcedTheme: string | undefined,
    themes: string[],
    value: ValueObject | undefined,
    enableSystem: boolean,
    enableColorScheme: boolean
) => {
    const el = document.documentElement;
    const systemThemes = ["light", "dark"];

    function updateDOM(theme: string) {
        const attributes = Array.isArray(attribute) ? attribute : [attribute];

        attributes.forEach((attr) => {
            const isClass = attr === "class";
            const classes =
                isClass && value ? themes.map((t) => value[t] || t) : themes;
            if (isClass) {
                el.classList.remove(...classes);
                el.classList.add(value && value[theme] ? value[theme] : theme);
            } else {
                el.setAttribute(attr, theme);
            }
        });

        setColorScheme(theme);
    }

    function setColorScheme(theme: string) {
        if (enableColorScheme && systemThemes.includes(theme)) {
            el.style.colorScheme = theme;
        }
    }

    function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    if (forcedTheme) {
        updateDOM(forcedTheme);
    } else {
        try {
            const themeName = localStorage.getItem(storageKey) || defaultTheme;
            const isSystem = enableSystem && themeName === "system";
            const theme = isSystem ? getSystemTheme() : themeName;
            updateDOM(theme);
        } catch (e) { }
    }
};

export const MEDIA = "(prefers-color-scheme: dark)";
export const isServer = typeof window === "undefined";

export const saveToLS = (storageKey: string, value: string) => {
    try {
        localStorage.setItem(storageKey, value);
    } catch (e) { }
};

export const getTheme = (key: string, fallback?: string) => {
    if (isServer) return undefined;
    let theme;
    try {
        theme = localStorage.getItem(key) || undefined;
    } catch (e) { }
    return theme || fallback;
};

export const disableAnimation = (nonce?: string) => {
    const css = document.createElement("style");
    if (nonce) css.setAttribute("nonce", nonce);
    css.appendChild(
        document.createTextNode(
            `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
    );
    document.head.appendChild(css);

    return () => {
        (() => window.getComputedStyle(document.body))();

        setTimeout(() => {
            document.head.removeChild(css);
        }, 1);
    };
};

export const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent) => {
    if (!e) e = window.matchMedia(MEDIA);
    const isDark = e.matches;
    const systemTheme = isDark ? "dark" : "light";
    return systemTheme;
};

interface ThemeStore extends UseThemeProps {
    setTheme: (theme: string) => void;
    setResolvedTheme: (theme: string) => void;
    setSystemTheme: (theme: "light" | "dark") => void;
}

export const useTheme = create<ThemeStore>((set) => ({
    themes: [],
    theme: "",
    resolvedTheme: "",
    systemTheme: undefined,
    setTheme: (theme) => set({ theme }),
    setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
    setSystemTheme: (systemTheme) => set({ systemTheme }),
}));
