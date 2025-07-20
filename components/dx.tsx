"use client";

import * as React from "react";
import {
    useTheme,
    script,
    MEDIA,
    getTheme,
    disableAnimation,
    getSystemTheme,
    saveToLS,
    DXProps,
    Attribute,
} from "@/lib/theme";

const defaultThemes = ["light", "dark"];

export const DX = ({
    forcedTheme,
    disableTransitionOnChange = true,
    enableSystem = true,
    enableColorScheme = true,
    storageKey = "theme",
    themes = defaultThemes,
    defaultTheme = "system",
    attribute = "class",
    value,
    children,
    nonce,
    scriptProps,
}: DXProps) => {
    const { theme, setTheme, setResolvedTheme, setSystemTheme } = useTheme();

    const applyTheme = React.useCallback(
        (themeToApply: string) => {
            let resolved = themeToApply;
            if (!resolved) return;

            if (themeToApply === "system" && enableSystem) {
                resolved = getSystemTheme();
            }

            setResolvedTheme(resolved);

            const name = value ? value[resolved] : resolved;
            const enable = disableTransitionOnChange ? disableAnimation(nonce) : null;
            const d = document.documentElement;

            const handleAttribute = (attr: Attribute) => {
                if (attr === "class") {
                    d.classList.remove(...(value ? Object.values(value) : themes));
                    if (name) d.classList.add(name);
                } else if (attr.startsWith("data-")) {
                    if (name) {
                        d.setAttribute(attr, name);
                    } else {
                        d.removeAttribute(attr);
                    }
                }
            };

            if (Array.isArray(attribute)) {
                attribute.forEach(handleAttribute);
            } else {
                handleAttribute(attribute);
            }

            if (enableColorScheme) {
                const fallback = ["light", "dark"].includes(defaultTheme)
                    ? defaultTheme
                    : null;
                const colorScheme = ["light", "dark"].includes(resolved)
                    ? resolved
                    : fallback;
                d.style.colorScheme = colorScheme as any;
            }

            enable?.();
        },
        [
            attribute,
            defaultTheme,
            disableTransitionOnChange,
            enableColorScheme,
            enableSystem,
            nonce,
            setResolvedTheme,
            themes,
            value,
        ]
    );

    const handleMediaQuery = React.useCallback(
        (e: MediaQueryListEvent | MediaQueryList) => {
            const newSystemTheme = getSystemTheme(e);
            setSystemTheme(newSystemTheme);
            if (theme === "system" && !forcedTheme) {
                applyTheme("system");
            }
        },
        [applyTheme, forcedTheme, setSystemTheme, theme]
    );

    React.useEffect(() => {
        const storedTheme = getTheme(storageKey, defaultTheme) ?? defaultTheme;
        setTheme(storedTheme);
        handleMediaQuery(window.matchMedia(MEDIA));
    }, []);

    React.useEffect(() => {
        if (theme) {
            applyTheme(forcedTheme ?? theme);
            if (!forcedTheme) {
                saveToLS(storageKey, theme);
            }
        }
    }, [theme, forcedTheme, applyTheme, storageKey]);

    React.useEffect(() => {
        const media = window.matchMedia(MEDIA);
        media.addListener(handleMediaQuery);

        const handleStorage = (e: StorageEvent) => {
            if (e.key !== storageKey) return;
            const newTheme = e.newValue || defaultTheme;
            setTheme(newTheme);
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            media.removeListener(handleMediaQuery);
            window.removeEventListener("storage", handleStorage);
        };
    }, [defaultTheme, handleMediaQuery, setTheme, storageKey]);

    return (
        <>
            <ThemeScript
                {...{
                    forcedTheme,
                    storageKey,
                    attribute,
                    enableSystem,
                    enableColorScheme,
                    defaultTheme,
                    value,
                    themes,
                    nonce,
                    scriptProps,
                }}
            />
            {children}
        </>
    );
};

export const ThemeScript = React.memo(
    ({
        forcedTheme,
        storageKey,
        attribute,
        enableSystem,
        enableColorScheme,
        defaultTheme,
        value,
        themes,
        nonce,
        scriptProps,
    }: Omit<DXProps, "children"> & { defaultTheme: string }) => {
        const scriptArgs = JSON.stringify([
            attribute,
            storageKey,
            defaultTheme,
            forcedTheme,
            themes,
            value,
            enableSystem,
            enableColorScheme,
        ]).slice(1, -1);

        return (
            <script
                {...scriptProps}
                suppressHydrationWarning
                nonce={typeof window === "undefined" ? nonce : ""}
                dangerouslySetInnerHTML={{
                    __html: `(${script.toString()})(${scriptArgs})`,
                }}
            />
        );
    }
);