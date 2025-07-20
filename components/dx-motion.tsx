"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback, CSSProperties, JSX } from "react";
import {
    useTheme,
    script as themeScript,
    MEDIA,
    getTheme,
    disableAnimation,
    getSystemTheme,
    saveToLS,
    DXProps,
    Attribute,
} from "@/lib/theme";
import { onPointerDown, onPointerUp, onMouseEnter, onMouseLeave, onFocus, onBlur } from "@/lib/interaction";

import {
    MotionValue, AnimationValues, Transition, DraggableProps, MotionComponentProps,
    LayoutGroupContext, PresenceContext, MotionContext, ReorderContext,
    useMotionValue, useReducedMotion, useInView, useLayoutAnimation, usePanGesture,
    animate, numberRegex, colorRegex,
} from "@/lib/motion";

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

    const applyTheme = useCallback(
        (themeToApply: string) => {},
        [attribute, defaultTheme, disableTransitionOnChange, enableColorScheme, enableSystem, nonce, setResolvedTheme, themes, value]
    );

    const handleMediaQuery = useCallback(
        (e: MediaQueryListEvent | MediaQueryList) => {},
        [applyTheme, forcedTheme, setSystemTheme, theme]
    );

    useEffect(() => {
        const storedTheme = getTheme(storageKey, defaultTheme) ?? defaultTheme;
        setTheme(storedTheme);
        handleMediaQuery(window.matchMedia(MEDIA));
    }, []);

    useEffect(() => {
        if (theme) {
            applyTheme(forcedTheme ?? theme);
            if (!forcedTheme) saveToLS(storageKey, theme);
        }
    }, [theme, forcedTheme, applyTheme, storageKey]);

    useEffect(() => {
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
            <ThemeScript {...{ forcedTheme, storageKey, attribute, enableSystem, enableColorScheme, defaultTheme, value, themes, nonce, scriptProps }} />
            {children}
        </>
    );
};

export const ThemeScript = React.memo(
    ({ forcedTheme, storageKey, attribute, enableSystem, enableColorScheme, defaultTheme, value, themes, nonce, scriptProps }: Omit<DXProps, "children"> & { defaultTheme: string }) => {
        const scriptArgs = JSON.stringify([attribute, storageKey, defaultTheme, forcedTheme, themes, value, enableSystem, enableColorScheme]).slice(1, -1);
        return (
            <script
                {...scriptProps}
                suppressHydrationWarning
                nonce={typeof window === "undefined" ? nonce : ""}
                dangerouslySetInnerHTML={{ __html: `(${themeScript.toString()})(${scriptArgs})` }}
            />
        );
    }
);

export const LayoutGroup = ({ children }: { children: React.ReactNode }) => {
    const [id] = useState(() => `layout-group-${Math.random().toString(36).substr(2, 9)}`);
    const [rects] = useState(() => new Map());
    return <LayoutGroupContext.Provider value={{ id, rects }}>{children}</LayoutGroupContext.Provider>;
};

export const MotionConfig = ({ children, ...props }: React.PropsWithChildren<Partial<MotionComponentProps>>) => (
    <MotionContext.Provider value={props}>{children}</MotionContext.Provider>
);

export function AnimatePresence({ children, mode }: { children: React.ReactNode; mode?: "wait" | "popLayout" | "sync" }) {
    const [presentChildren, setPresentChildren] = useState<React.ReactElement[]>([]);
    const exiting = useRef(new Set<string | number>()).current;

    const onExitComplete = useCallback((key: string | number) => {
        exiting.delete(key);
        setPresentChildren(prev => prev.filter(c => c.key !== key));
    }, [exiting]);

    useLayoutEffect(() => {
        const newChildren = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[];
        const newKeys = new Set(newChildren.map(c => c.key!));
        const prevKeys = new Set(presentChildren.map(c => c.key!));
        const exitingChildren = presentChildren.filter(c => !newKeys.has(c.key!));
        exitingChildren.forEach(child => exiting.add(child.key!));
        
        setPresentChildren(prev => {
            const current = prev.filter(c => !exiting.has(c.key!));
            const entering = newChildren.filter(c => !prevKeys.has(c.key!));
            return [...current, ...entering];
        });
    }, [children, exiting, presentChildren]);
    
    return (
        <PresenceContext.Provider value={{ isPresent: true, onExitComplete }}>
            {presentChildren.map(child => {
                const isExiting = exiting.has(child.key!);
                return (
                    <PresenceContext.Provider key={child.key} value={{ isPresent: !isExiting, onExitComplete: () => onExitComplete(child.key!) }}>
                        {React.cloneElement(child, { _isExiting: isExiting } as any)}
                    </PresenceContext.Provider>
                );
            })}
        </PresenceContext.Provider>
    );
}

const svgTags = new Set(["svg", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "g", "text", "tspan", "textPath", "defs", "marker", "symbol", "clipPath", "mask", "foreignObject"]);

const motionComponent = <P extends object, R>(Component: React.ForwardRefExoticComponent<P & React.RefAttributes<R>>, isSVG = false) => {
    return React.forwardRef<R, P & MotionComponentProps & { _isExiting?: boolean }>((props, externalRef) => {
        const config = useContext(MotionContext);
        const presence = useContext(PresenceContext);
        const { animate: animateProps, initial, exit, transition, whileHover, whileTap, whileFocus, whileInView, viewport, drag, dragConstraints, onDragStart, onDrag, onDragEnd, layout, layoutId, style, _isExiting, ...rest } = { ...config, ...props };
        
        const internalRef = useRef<HTMLElement>(null);
        const ref = (externalRef || internalRef) as React.RefObject<HTMLElement>;
        
        const reducedMotion = useReducedMotion();
        const isMounted = useRef(false);
        const isInView = useInView(ref, viewport);

        const motionValues = useMemo(() => {
            const values: { [key: string]: MotionValue<any> } = {};
            const allKeys = { ...style, ...initial, ...animateProps, ...whileHover, ...whileTap, ...exit, ...whileInView, ...whileFocus };
            for (const key in allKeys) {
                 if (key.startsWith("--") || typeof (allKeys as any)[key] === "number" || (typeof (allKeys as any)[key] === "string" && ((allKeys as any)[key].match(numberRegex) || (allKeys as any)[key].match(colorRegex)))) {
                    const initialValue = (style as any)?.[key] ?? (initial as any)?.[key] ?? (key === "scale" ? 1 : 0);
                    values[key] = useMotionValue(initialValue);
                }
            }
            return values;
        }, [animateProps, exit, initial, style, whileFocus, whileHover, whileInView, whileTap]);

        const runAnimation = useCallback((values: AnimationValues | undefined, onComplete?: () => void) => {
            if (!values || reducedMotion) {
                onComplete?.();
                return;
            }
            const animations = Object.keys(values).map((key, i) => new Promise(resolve => {
                const mv = motionValues[key];
                if (mv) {
                    const valueTransition = { ...transition, ...(values as any)[key]?.transition };
                    const delay = typeof valueTransition.delay === "function" ? valueTransition.delay(i, Object.keys(values).length) : valueTransition.delay;
                    animate({ from: mv.get(), to: Array.isArray((values as any)[key]) ? (values as any)[key][(values as any)[key].length - 1] : (values as any)[key], ...valueTransition, delay, onUpdate: latest => mv.set(latest), onComplete: () => resolve(null) });
                } else {
                    resolve(null);
                }
            }));
            Promise.all(animations).then(() => onComplete?.());
        }, [motionValues, transition, reducedMotion]);

        useLayoutEffect(() => {}, [motionValues, ref, isSVG]);
        
        usePanGesture(ref, { drag, dragConstraints, onDragStart, onDrag, onDragEnd, dragMomentum: (props as any).dragMomentum, dragTransition: (props as any).dragTransition }, motionValues);
        useLayoutAnimation(ref, layoutId, layout ?? false);

        return (
            <Component ref={ref as any} style={{ ...style, cursor: drag ? "grab" : "auto" } as CSSProperties} {...(rest as P)} />
        );
    });
};

type MotionFactory = {
    [Tag in keyof (JSX.IntrinsicElements & JSX.IntrinsicElements)]: React.ForwardRefExoticComponent<MotionComponentProps & React.RefAttributes<any>>;
};

const factory = new Proxy({}, {
    get: (target, prop: string) => {
        return motionComponent(React.forwardRef((props, ref) => React.createElement(prop, { ...props, ref })), svgTags.has(prop));
    },
});

export const motion = factory as MotionFactory;

export function useText(text: string, splitBy: "char" | "word" | "line" = "char") {
    return useMemo(() => {
        let parts: string[];
        if (splitBy === "line") parts = text.split("\n");
        else if (splitBy === "word") parts = text.split(" ");
        else parts = Array.from(text);
        return parts.map((part, i) => <motion.span key={i} style={{ display: "inline-block" }}>{part}{splitBy === "word" ? " " : ""}</motion.span>);
    }, [text, splitBy]);
}

export const Reorder = {
    Group: ({ children, values, onReorder }: { children: React.ReactNode, values: any[], onReorder: (newOrder: any[]) => void }) => {
        const positions = useRef(new Map()).current;
        const register = (value: any, y: MotionValue<any>) => positions.set(value, y);
        const unregister = (value: any) => positions.delete(value);
        const handleReorder = (from: number, to: number) => {
            const newValues = [...values];
            const [moved] = newValues.splice(from, 1);
            newValues.splice(to, 0, moved);
            onReorder(newValues);
        };
        return (<LayoutGroup><ReorderContext.Provider value={{ onReorder: handleReorder, register, unregister }}>{children}</ReorderContext.Provider></LayoutGroup>);
    },
    Item: ({ children, value, ...props }: { children: React.ReactNode, value: any } & MotionComponentProps) => {
        const y = useMotionValue(0);
        const reorderContext = useContext(ReorderContext);
        useEffect(() => {
            reorderContext?.register(value, y);
            return () => reorderContext?.unregister(value);
        }, [value, y, reorderContext]);
        return (<motion.div layoutId={value as string} drag="y" style={{ y } as any} onDragEnd={() => {}} {...props}>{children}</motion.div>);
    }
};
