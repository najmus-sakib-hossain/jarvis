import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import React, { createContext } from "react";
import { onPointerDown, onPointerUp, onMouseEnter, onMouseLeave, onFocus, onBlur } from "@/lib/interaction";

export type MotionValue<T = any> = {
    id: string;
    get: () => T;
    set: (value: T) => void;
    onChange: (callback: (value: T) => void) => () => void;
    getVelocity: () => number;
};
export type EasingFunction = (v: number) => number;
export type AnimationValues = { [key: string]: any | any[] };
export type Point = { x: number; y: number };
export type Transition = {
    type?: "spring" | "tween" | "inertia" | "physics";
    duration?: number;
    ease?: EasingFunction | [number, number, number, number] | "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate" | "bounce" | "bounceIn" | "bounceOut" | "bounceInOut" | "wiggle";
    stiffness?: number;
    damping?: number;
    mass?: number;
    delay?: number | ((i: number) => number);
    onComplete?: () => void;
    power?: number;
    timeConstant?: number;
    modifyTarget?: (v: number) => number;
    acceleration?: number;
    friction?: number;
};
export type AnimationOptions = { from: any; to: any; onUpdate?: (latest: any) => void; velocity?: number } & Transition;
export type AnimationControls = { stop: () => void; isPlaying: () => boolean; play: () => void; pause: () => void; reverse: () => void; seek: (time: number) => void; timeScale: (scale: number) => void;};
export type PanInfo = { point: Point; delta: Point; offset: Point; velocity: Point };
export type DraggableProps = { drag?: boolean | "x" | "y"; dragConstraints?: React.RefObject<Element> | { top?: number; left?: number; right?: number; bottom?: number }; onDragStart?: (event: PointerEvent, info: PanInfo) => void; onDrag?: (event: PointerEvent, info: PanInfo) => void; onDragEnd?: (event: PointerEvent, info: PanInfo) => void; dragControls?: ReturnType<typeof useDragControls>; dragMomentum?: boolean; dragTransition?: Transition; };
export type MotionComponentProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd"> & DraggableProps & { animate?: AnimationValues; initial?: AnimationValues; exit?: AnimationValues; transition?: Transition; whileHover?: AnimationValues; whileTap?: AnimationValues; whileFocus?: AnimationValues; whileInView?: AnimationValues; viewport?: IntersectionObserverInit & { once?: boolean }; layout?: boolean | "position" | "size"; layoutId?: string; };
interface MotionStore { values: Map<string, { value: any; velocity: number; lastUpdate: number }>; setValue: (key: string, value: any) => void; subscribe: (key: string, callback: (value: any) => void) => () => void; }

export const clamp = (min: number, max: number, v: number) => Math.min(Math.max(v, min), max);
const progress = (from: number, to: number, value: number) => (to - from === 0 ? 1 : (value - from) / (to - from));
export const mix = (from: number, to: number, p: number) => -p * from + p * to + from;

export const colorRegex = /#(?:[0-9a-f]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)/gi;
export const numberRegex = /-?\d*\.?\d+/g;

const mixColor = (from: string, to: string, p: number) => {
    const fromRGBA = toRGBA(from);
    const toRGBA_val = toRGBA(to);
    const result = fromRGBA.map((v, i) => Math.round(mix(v, toRGBA_val[i], p)));
    return `rgba(${result[0]}, ${result[1]}, ${result[2]}, ${result[3]})`;
};

const toRGBA = (color: string): [number, number, number, number] => {
    if (color.startsWith("#")) {
        const hex = color.slice(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return [r, g, b, 1];
    }
    const [r, g, b, a = 1] = color.match(/\d+/g)!.map(Number);
    return [r, g, b, a];
};

const mixComplex = (from: string, to: string, p: number) => {
    const fromNumbers = from.match(numberRegex)?.map(Number) || [];
    const toNumbers = to.match(numberRegex)?.map(Number) || [];
    const fromColors = from.match(colorRegex) || [];
    const toColors = to.match(colorRegex) || [];

    let i = 0;
    let j = 0;
    return to.replace(colorRegex, () => mixColor(fromColors[j], toColors[j++], p))
             .replace(numberRegex, () => mix(fromNumbers[i], toNumbers[i++], p).toString());
}

export const useMotionStore = create(subscribeWithSelector<MotionStore>((set, get) => ({
    values: new Map(),
    setValue: (key, value) => {
        const now = performance.now();
        const state = get();
        const prev = state.values.get(key) || { value: 0, velocity: 0, lastUpdate: now };
        const timeDelta = Math.max(1, now - prev.lastUpdate);
        const newVelocity = typeof value === "number" && typeof prev.value === "number" ? (value - prev.value) / timeDelta * 1000 : 0;
        set({ values: new Map(state.values).set(key, { value, velocity: newVelocity, lastUpdate: now }) });
    },
    subscribe: (key: string, callback: (value: any) => void): (() => void) => {
        const unsub = useMotionStore.subscribe(
            (state) => state.values.get(key)?.value,
            (val) => { if (val !== undefined) callback(val); }
        );
        return unsub;
    },
})));

const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
    const ax = 3 * x1 - 3 * x2 + 1;
    const bx = 3 * x2 - 6 * x1;
    const cx = 3 * x1;
    const ay = 3 * y1 - 3 * y2 + 1;
    const by = 3 * y2 - 6 * y1;
    const cy = 3 * y1;
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const solveCurveX = (x: number) => {
        let t2 = x;
        for (let i = 0; i < 8; i++) {
            const x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < 1e-6) return t2;
            const d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
            if (Math.abs(d2) < 1e-6) break;
            t2 = t2 - x2 / d2;
        }
        return t2;
    };
    return (x: number) => sampleCurveY(solveCurveX(x));
};

const bounceOut = (p: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (p < 1 / d1) {
        return n1 * p * p;
    } else if (p < 2 / d1) {
        return n1 * (p -= 1.5 / d1) * p + 0.75;
    } else if (p < 2.5 / d1) {
        return n1 * (p -= 2.25 / d1) * p + 0.9375;
    } else {
        return n1 * (p -= 2.625 / d1) * p + 0.984375;
    }
};

export const easings = {
    linear: (v: number) => v,
    easeIn: cubicBezier(0.42, 0, 1, 1),
    easeOut: cubicBezier(0, 0, 0.58, 1),
    easeInOut: cubicBezier(0.42, 0, 0.58, 1),
    circIn: (p: number) => 1 - Math.sqrt(1 - p * p),
    circOut: (p: number) => Math.sqrt(1 - Math.pow(p - 1, 2)),
    circInOut: (p: number) => p < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * p, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * p + 2, 2)) + 1) / 2,
    backIn: (p: number) => 2.70158 * p * p * p - 1.70158 * p * p,
    backOut: (p: number) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2),
    backInOut: (p: number) => p < 0.5 ? (Math.pow(2 * p, 2) * ((2.59491) * 2 * p - 1.59491)) / 2 : (Math.pow(2 * p - 2, 2) * ((2.59491) * (p * 2 - 2) + 1.59491) + 2) / 2,
    anticipate: (p: number) => (p *= 2) < 1 ? 0.5 * (p * p * p - p * p) : 0.5 * ((p -= 2) * p * p + 2),
    bounceIn: (p: number) => 1 - bounceOut(1 - p),
    bounceOut,
    bounceInOut: (p: number) => p < 0.5 ? (1 - bounceOut(1 - 2 * p)) / 2 : (1 + bounceOut(2 * p - 1)) / 2,
    steps: (n: number, direction: "start" | "end" = "end") => (p: number) => {
        const step = Math.floor(p * n);
        return direction === "end" ? step / (n - 1) : step / n;
    },
    wiggle: (p: number, wiggles = 10) => -Math.cos(p * Math.PI * (wiggles - 0.5)) * Math.exp(-p * p * 5) + 1,
};

export function animate({ from, to, onUpdate, onComplete, velocity = 0, ...options }: AnimationOptions): AnimationControls {
    let isActive = true;
    let isReversed = false;
    let currentTime = 0;
    let scale = 1;
    const { duration = 0.3, ease: easeOption = easings.easeInOut, type = "tween", stiffness = 100, damping = 10, mass = 1, delay = 0, power = 0.8, timeConstant = 325, modifyTarget, acceleration = 0, friction = 0.1 } = options;
    let animationFrame: number;
    const ease = typeof easeOption === "string" ? (easings as any)[easeOption] : Array.isArray(easeOption) ? cubicBezier(...easeOption) : easeOption;

    const stop = () => {
        isActive = false;
        cancelAnimationFrame(animationFrame);
    };
    
    let tick: (timestamp: number) => void;
    let lastTime: number;

    if (type === "inertia") {
        tick = (timestamp: number) => {
            if (!isActive) return;
            const elapsed = timestamp - lastTime;
            const delta = -velocity * Math.exp(-elapsed / timeConstant);
            from += delta;
            onUpdate?.(from);
            if (Math.abs(velocity) < 1) {
                onComplete?.();
                stop();
            } else {
                velocity *= Math.exp(-elapsed / timeConstant);
                animationFrame = requestAnimationFrame(tick);
            }
            lastTime = timestamp;
        };
    } else if (type === "physics") {
        let position = from;
        let v = velocity;
        tick = (timestamp: number) => {
            if (!isActive) return;
            const elapsed = (timestamp - lastTime) / 1000;
            v += acceleration * elapsed;
            v *= (1 - friction);
            position += v * elapsed;
            onUpdate?.(position);
            if (Math.abs(v) < 0.1) {
                stop();
                onComplete?.();
            } else {
                animationFrame = requestAnimationFrame(tick);
            }
            lastTime = timestamp;
        };
    } else {
        tick = (timestamp: number) => {
            if (!isActive) return;
            currentTime += (timestamp - (lastTime || timestamp)) * scale;
            lastTime = timestamp;

            const p = clamp(0, 1, currentTime / (duration * 1000));
            const easedProgress = ease(p);
            
            let latest;
            if (typeof from === "number" && typeof to === "number") {
                latest = mix(from, to, easedProgress);
            } else if (typeof from === "string" && typeof to === "string") {
                if (from.match(colorRegex) && to.match(colorRegex)) {
                    latest = mixColor(from, to, easedProgress);
                } else {
                    latest = mixComplex(from, to, easedProgress);
                }
            }
            
            onUpdate?.(latest);

            if ((!isReversed && p >= 1) || (isReversed && p <= 0)) {
                onComplete?.();
                stop();
            } else {
                animationFrame = requestAnimationFrame(tick);
            }
        };
    }

    const play = () => {
        isActive = true;
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(tick);
    };

    const pause = () => { isActive = false; };
    const reverse = () => { isReversed = !isReversed; };
    const seek = (time: number) => { currentTime = time * 1000; };
    const timeScale = (newScale: number) => { scale = newScale; };
    
    setTimeout(play, typeof delay === "number" ? delay * 1000 : 0);

    return { stop, isPlaying: () => isActive, play, pause, reverse, seek, timeScale };
}

export const LayoutGroupContext = createContext<{ id: string, rects: Map<string, DOMRect> } | null>(null);
export const MotionContext = createContext<Partial<MotionComponentProps>>({});
export const PresenceContext = createContext<{ isPresent: boolean; onExitComplete?: (id: string | number) => void; } | null>(null);
export const ReorderContext = createContext<{
    onReorder: (from: number, to: number) => void;
    register: (value: any, y: MotionValue<number>) => void;
    unregister: (value: any) => void;
} | null>(null);

export function useTimeline(sequence: [string | MotionValue, AnimationValues, Transition?][]) {
    const { useMemo } = React;
    return useMemo(() => {
    }, [sequence]);
}

export function useMotionValue<T>(initialValue: T): MotionValue<T> {
    const { useEffect, useMemo } = React;
    const store = useMotionStore.getState();
    const id = useMemo(() => `motion-${Math.random().toString(36).substr(2, 9)}`, []);
    
    useEffect(() => {
        store.setValue(id, initialValue);
    }, [id, initialValue, store]);

    return useMemo(() => ({
        id,
        get: () => useMotionStore.getState().values.get(id)?.value ?? initialValue,
        set: (newValue: T) => store.setValue(id, newValue),
        onChange: (callback: (value: T) => void) => store.subscribe(id, callback),
        getVelocity: () => useMotionStore.getState().values.get(id)?.velocity ?? 0,
    }), [id, initialValue, store]);
}

export function useTransform<T, U>(value: MotionValue<T>, transformer: ((v: T) => U) | number[], outputRange?: U[]): MotionValue<U> {
    const { useEffect } = React;
    const initialTransformedValue = () => {
        const latest = value.get();
        if (typeof transformer === "function") return transformer(latest);
        if (Array.isArray(transformer) && outputRange) {
            const p = progress(transformer[0], transformer[1], latest as any);
            return mix(outputRange[0] as any, outputRange[1] as any, p);
        }
        return latest as any;
    };
    
    const transformedValue = useMotionValue(initialTransformedValue());

    useEffect(() => {
        const unsubscribe = value.onChange(latest => {
            let newValue;
            if (typeof transformer === "function") {
                newValue = transformer(latest);
            } else if (Array.isArray(transformer) && outputRange) {
                const p = progress(transformer[0] as number, transformer[1] as number, latest as any);
                newValue = mix(outputRange[0] as any, outputRange[1] as any, p);
            }
            if (newValue !== undefined) transformedValue.set(newValue);
        });
        return () => unsubscribe();
    }, [value, transformer, outputRange, transformedValue]);

    return transformedValue;
}

export function useScroll(options?: { container?: React.RefObject<HTMLElement> }) {
    const { useEffect } = React;
    const scrollX = useMotionValue(0);
    const scrollY = useMotionValue(0);
    const scrollXProgress = useMotionValue(0);
    const scrollYProgress = useMotionValue(0);
    const scrollXVelocity = useMotionValue(0);
    const scrollYVelocity = useMotionValue(0);

    useEffect(() => {
        const element = options?.container?.current || window;
        const handleScroll = () => {
            const x = "scrollX" in element ? element.scrollX : element.scrollLeft;
            const y = "scrollY" in element ? element.scrollY : element.scrollTop;
            scrollX.set(x);
            scrollY.set(y);
            scrollXVelocity.set(scrollX.getVelocity());
            scrollYVelocity.set(scrollY.getVelocity());
            const scrollWidth = 'scrollWidth' in element ? (element as HTMLElement).scrollWidth : document.documentElement.scrollWidth;
            const clientWidth = 'clientWidth' in element ? (element as HTMLElement).clientWidth : document.documentElement.clientWidth;
            const scrollHeight = 'scrollHeight' in element ? (element as HTMLElement).scrollHeight : document.documentElement.scrollHeight;
            const clientHeight = 'clientHeight' in element ? (element as HTMLElement).clientHeight : document.documentElement.clientHeight;
            scrollXProgress.set(x / (scrollWidth - clientWidth));
            scrollYProgress.set(y / (scrollHeight - clientHeight));
        };
        
        element.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => element.removeEventListener("scroll", handleScroll);
    }, [options?.container, scrollX, scrollY, scrollXProgress, scrollYProgress, scrollXVelocity, scrollYVelocity]);

    return { scrollX, scrollY, scrollXProgress, scrollYProgress, scrollXVelocity, scrollYVelocity };
}

export function useScrollTo(options?: Transition) {
    const { useCallback } = React;
    return useCallback((target: number | string | HTMLElement) => {
        let targetY: number;
        if (typeof target === "number") targetY = target;
        else if (typeof target === "string") {
            const el = document.querySelector(target);
            if (!el) return;
            targetY = window.scrollY + el.getBoundingClientRect().top;
        } else {
            targetY = window.scrollY + target.getBoundingClientRect().top;
        }

        animate({ from: window.scrollY, to: targetY, onUpdate: (v) => window.scrollTo(0, v), ...options });
    }, [options]);
}

export function useSmoothScroll(options?: { stiffness?: number, damping?: number, mass?: number }) {
    const { useEffect } = React;
    const { stiffness = 100 } = options || {};
    const smoothedScrollY = useMotionValue(window.scrollY);

    useEffect(() => {
        let animationFrame: number;
        const tick = () => {
            const current = smoothedScrollY.get();
            const target = window.scrollY;
            const newPosition = mix(current, target, 1 / (stiffness / 10));
            smoothedScrollY.set(newPosition);
            animationFrame = requestAnimationFrame(tick);
        };
        animationFrame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrame);
    }, [smoothedScrollY, stiffness]);
    
    return smoothedScrollY;
}

export function stagger(duration: number, options: { start?: number, from?: "first" | "last" | "center", ease?: EasingFunction } = {}) {
    const { start = 0, from = "first", ease } = options;
    return (i: number, total: number) => {
        const fromIndex = from === "first" ? 0 : from === "last" ? total - 1 : Math.floor(total / 2);
        const distance = Math.abs(i - fromIndex);
        let p = progress(0, total - 1, distance);
        if (ease) p = ease(p);
        return start + p * duration;
    };
}

export function useScramble(text: string, options?: { duration?: number, characters?: string }) {
    const { useEffect } = React;
    const { duration = 2, characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890" } = options || {};
    const scrambledText = useMotionValue(text);

    useEffect(() => {
        let animationFrame: number;
        const startTime = performance.now();
        const tick = () => {
            const elapsed = performance.now() - startTime;
            const p = clamp(0, 1, elapsed / (duration * 1000));
            const newText = Array.from(text).map((char, i) => {
                if (p > i / text.length) return char;
                return characters[Math.floor(Math.random() * characters.length)];
            }).join("");
            scrambledText.set(newText);
            if (p < 1) animationFrame = requestAnimationFrame(tick);
        };
        animationFrame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrame);
    }, [text, duration, characters, scrambledText]);

    return scrambledText;
}

export function useMotionPath(pathRef: React.RefObject<SVGPathElement>, progress: MotionValue<number>) {
    const { useLayoutEffect } = React;
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    useLayoutEffect(() => {
        if (!pathRef.current) return;
        const path = pathRef.current;
        const pathLength = path.getTotalLength();
        
        const unsubscribe = progress.onChange(p => {
            const point = path.getPointAtLength(p * pathLength);
            x.set(point.x);
            y.set(point.y);
        });
        return () => unsubscribe();
    }, [pathRef, progress, x, y]);

    return { x, y };
}

export function useLayoutAnimation(ref: React.RefObject<HTMLElement>, layoutId: string | undefined, layout: boolean | "position" | "size") {
    const { useContext, useRef, useLayoutEffect } = React;
    const layoutGroup = useContext(LayoutGroupContext);
    const prevRect = useRef<DOMRect | null>(null);

    useLayoutEffect(() => {
        if (!layout || !ref.current) return;
        
        const newRect = ref.current.getBoundingClientRect();
        let startRect = prevRect.current;
        if (layoutId && layoutGroup?.rects.has(layoutId)) {
            startRect = layoutGroup.rects.get(layoutId)!;
        }

        if (startRect) {
            const deltaX = startRect.left - newRect.left;
            const deltaY = startRect.top - newRect.top;
            const scaleX = startRect.width / newRect.width;
            const scaleY = startRect.height / newRect.height;

            if (deltaX !== 0 || deltaY !== 0 || scaleX !== 1 || scaleY !== 1) {
                ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
                ref.current.style.transformOrigin = "top left";
                requestAnimationFrame(() => {
                    ref.current!.style.transition = "transform 0.3s";
                    ref.current!.style.transform = "";
                });
            }
        }

        if (layoutId && layoutGroup) layoutGroup.rects.set(layoutId, newRect);
        prevRect.current = newRect;
    });
}

export function useInView(ref: React.RefObject<Element>, options: IntersectionObserverInit & { once?: boolean } = {}) {
    const { useState, useEffect } = React;
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
            if (entry.isIntersecting && options.once) observer.disconnect();
        }, options);

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, options]);

    return isInView;
}

export function usePanGesture(
    ref: React.RefObject<HTMLElement>,
    { drag, dragConstraints, onDragStart, onDrag, onDragEnd, dragMomentum, dragTransition }: DraggableProps,
    motionValues: { x?: MotionValue<number>; y?: MotionValue<number> }
) {
    const { useRef, useCallback } = React;
    const isDragging = useRef(false);
    const startPoint = useRef({ x: 0, y: 0 });

    const handlePointerDown = useCallback((event: PointerEvent) => {
        if (!drag || !ref.current) return;
        isDragging.current = true;
        ref.current.style.cursor = "grabbing";
        ref.current.setPointerCapture(event.pointerId);

        const info: PanInfo = {
            point: { x: event.clientX, y: event.clientY },
            delta: { x: 0, y: 0 },
            offset: { x: motionValues.x?.get() || 0, y: motionValues.y?.get() || 0 },
            velocity: { x: 0, y: 0 },
        };
        startPoint.current = info.point;
        onDragStart?.(event, info);

        const handlePointerMove = (moveEvent: PointerEvent) => {
        };
        const handlePointerUp = (upEvent: PointerEvent) => {
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

    }, [drag, ref, motionValues.x, motionValues.y, onDragStart, onDrag, onDragEnd, dragConstraints, dragMomentum, dragTransition]);

    onPointerDown(ref, handlePointerDown);
}

export const useReducedMotion = () => {
    const { useState, useEffect } = React;
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);
        const listener = () => setReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
    }, []);
    return reducedMotion;
}

export const useDragControls = () => {
    const { useMemo } = React;
    return useMemo(() => ({ start: (e: React.PointerEvent) => {} }), []);
}
