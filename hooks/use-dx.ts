import {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback,
    useRef,
    useMemo,
    Dispatch,
    SetStateAction,
    RefObject,
  } from "react";
  
  type Setter<T> = Dispatch<SetStateAction<T>>;
  
  export const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  
  export function useBoolean(defaultValue?: boolean) {
    const [value, setValue] = useState(!!defaultValue);
  
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    const toggle = useCallback(() => setValue((x) => !x), []);
  
    return { value, setValue, setTrue, setFalse, toggle };
  }
  
  export function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element?: undefined,
    options?: boolean | AddEventListenerOptions
  ): void;
  export function useEventListener<
    K extends keyof HTMLElementEventMap,
    T extends HTMLElement = HTMLDivElement
  >(
    eventName: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    element: RefObject<T>,
    options?: boolean | AddEventListenerOptions
  ): void;
  export function useEventListener<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (event: DocumentEventMap[K]) => void,
    element: RefObject<Document>,
    options?: boolean | AddEventListenerOptions
  ): void;
  export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    element?: RefObject<any>,
    options?: boolean | AddEventListenerOptions
  ): void;
  export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    element?: RefObject<any>,
    options?: boolean | AddEventListenerOptions
  ) {
    const savedHandler = useRef(handler);
  
    useIsomorphicLayoutEffect(() => {
      savedHandler.current = handler;
    }, [handler]);
  
    useEffect(() => {
      const targetElement: any = element?.current ?? window;
      if (!(targetElement && targetElement.addEventListener)) {
        return;
      }
  
      const eventListener = (event: Event) => savedHandler.current(event);
  
      targetElement.addEventListener(eventName, eventListener, options);
  
      return () => {
        targetElement.removeEventListener(eventName, eventListener, options);
      };
    }, [eventName, element, options]);
  }
  
  export function useClickAnyWhere(handler: (event: MouseEvent) => void) {
    useEventListener("click", (event) => {
      handler(event as MouseEvent);
    });
  }
  
  export function useCopyToClipboard(): [
    string | null,
    (text: string) => Promise<boolean>,
  ] {
    const [copiedText, setCopiedText] = useState<string | null>(null);
  
    const copy = async (text: string) => {
      if (!navigator?.clipboard) {
        console.warn("Clipboard not supported");
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setCopiedText(null);
        return false;
      }
    };
  
    return [copiedText, copy];
  }
  
  export function useCountdown(
    countStart: number,
    intervalMs = 1000
  ): [number, { start: () => void; stop: () => void; reset: () => void }] {
    const [count, setCount] = useState(countStart);
    const intervalRef = useRef<number | null>(null);
  
    const start = useCallback(() => {
      if (intervalRef.current !== null) {
        return;
      }
      intervalRef.current = window.setInterval(() => {
        setCount((c) => c - 1);
      }, intervalMs);
    }, [intervalMs]);
  
    const stop = useCallback(() => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);
  
    const reset = useCallback(() => {
      stop();
      setCount(countStart);
    }, [countStart, stop]);
  
    useEffect(() => {
      if (count === 0) {
        stop();
      }
    }, [count, stop]);
  
    useEffect(() => {
      return () => stop();
    }, [stop]);
  
    return [count, { start, stop, reset }];
  }
  
  export function useCounter(initialValue?: number) {
    const [count, setCount] = useState(initialValue || 0);
  
    const increment = useCallback(() => setCount((x) => x + 1), []);
    const decrement = useCallback(() => setCount((x) => x - 1), []);
  
    return { count, increment, decrement, setCount };
  }
  
  export function useEventCallback<Args extends unknown[], R>(
    fn: (...args: Args) => R
  ): (...args: Args) => R {
    const ref = useRef<typeof fn>(() => {
      throw new Error("Cannot call an event handler while rendering.");
    });
  
    useIsomorphicLayoutEffect(() => {
      ref.current = fn;
    }, [fn]);
  
    return useCallback((...args: Args) => ref.current(...args), [ref]);
  }
  
  export function useLocalStorage<T>(
    key: string,
    initialValue: T
  ): [T, Setter<T>];
  export function useLocalStorage<T>(
    key: string,
    initialValue?: T
  ): [T | undefined, Setter<T | undefined>];
  export function useLocalStorage<T>(key: string, initialValue?: T) {
    const readValue = useCallback((): T | undefined => {
      if (typeof window === "undefined") {
        return initialValue;
      }
      try {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return initialValue;
      }
    }, [initialValue, key]);
  
    const [storedValue, setStoredValue] = useState<T | undefined>(readValue);
  
    const setValue: Setter<T | undefined> = useEventCallback((value) => {
      if (typeof window == "undefined") {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
      }
      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    });
  
    useEffect(() => {
      setStoredValue(readValue());
    }, [readValue]);
  
    const handleStorageChange = useCallback(
      (event: Event) => {
        if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
          return;
        }
        setStoredValue(readValue());
      },
      [key, readValue]
    );
  
    useEventListener("storage", handleStorageChange);
    useEventListener("local-storage", handleStorageChange);
  
    return [storedValue, setValue];
  }
  
  export function useMediaQuery(query: string): boolean {
    const getMatches = (query: string): boolean => {
      if (typeof window !== "undefined") {
        return window.matchMedia(query).matches;
      }
      return false;
    };
  
    const [matches, setMatches] = useState<boolean>(getMatches(query));
  
    function handleChange() {
      setMatches(getMatches(query));
    }
  
    useEffect(() => {
      const matchMedia = window.matchMedia(query);
      handleChange();
      matchMedia.addEventListener("change", handleChange);
      return () => {
        matchMedia.removeEventListener("change", handleChange);
      };
    }, [query]);
  
    return matches;
  }
  
  export function useDarkMode(defaultValue?: boolean): {
    isDarkMode: boolean;
    toggle: () => void;
    enable: () => void;
    disable: () => void;
  } {
    const isDarkOS = useMediaQuery("(prefers-color-scheme: dark)");
    const [isDarkMode, setDarkMode] = useLocalStorage<boolean>(
      "dark-mode",
      defaultValue ?? isDarkOS ?? false
    );
  
    useIsomorphicLayoutEffect(() => {
      setDarkMode(isDarkOS);
    }, [isDarkOS, setDarkMode]);
  
    return {
      isDarkMode,
      toggle: () => setDarkMode((prev) => !prev),
      enable: () => setDarkMode(true),
      disable: () => setDarkMode(false),
    };
  }
  
  export function useDebounceCallback<A extends any[]>(
    callback: (...args: A) => void,
    delay: number
  ): (...args: A) => void {
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
    return useCallback(
      (...args: A) => {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
          callback(...args);
        }, delay);
      },
      [callback, delay]
    );
  }
  
  export function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
    useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay);
      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);
  
    return debouncedValue;
  }
  
  export function useDocumentTitle(title: string): void {
    const defaultTitle = useRef(document.title);
  
    useIsomorphicLayoutEffect(() => {
      document.title = title;
    }, [title]);
  
    useIsomorphicLayoutEffect(() => {
      return () => {
        document.title = defaultTitle.current;
      };
    }, []);
  }
  
  export function useHover<T extends HTMLElement>(): [
    RefObject<T | null>,
    boolean,
  ] {
    const [value, setValue] = useState<boolean>(false);
    const ref = useRef<T | null>(null);
  
    const handleMouseOver = () => setValue(true);
    const handleMouseOut = () => setValue(false);
  
    useEventListener("mouseover", handleMouseOver, ref);
    useEventListener("mouseout", handleMouseOut, ref);
  
    return [ref, value];
  }
  
  export function useIntersectionObserver({
    root,
    rootMargin,
    threshold,
    onIntersect,
  }: {
    root?: RefObject<Element>;
    rootMargin?: string;
    threshold?: number | number[];
    onIntersect: () => void;
  }): RefObject<Element | null> {
    const targetRef = useRef<Element | null>(null);
  
    useEffect(() => {
      const el = targetRef.current;
      if (!el) {
        return;
      }
  
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => entry.isIntersecting && onIntersect()),
        {
          root: root?.current,
          rootMargin,
          threshold,
        }
      );
  
      observer.observe(el);
  
      return () => {
        observer.unobserve(el);
      };
    }, [root, rootMargin, threshold, onIntersect]);
  
    return targetRef;
  }
  
  export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);
  
    useIsomorphicLayoutEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      if (delay === null) {
        return;
      }
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }, [delay]);
  }
  
  export function useIsClient(): boolean {
    const [isClient, setClient] = useState(false);
    useEffect(() => {
      setClient(true);
    }, []);
    return isClient;
  }
  
  export function useIsMounted(): () => boolean {
    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);
  
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);
  
    return isMounted;
  }
  
  export function useMap<TKey, TValue>(
    initialState = new Map<TKey, TValue>()
  ) {
    const [value, setValue] = useState(initialState);
  
    const handlers = useMemo(
      () =>
        Object.assign(value, {
          set: (key: TKey, val: TValue) => {
            setValue((oldMap) => {
              const newMap = new Map(oldMap);
              newMap.set(key, val);
              return newMap;
            });
          },
          clear: () => setValue(new Map()),
          delete: (key: TKey) => {
            setValue((oldMap) => {
              const newMap = new Map(oldMap);
              newMap.delete(key);
              return newMap;
            });
          },
        }),
      [value]
    );
  
    return handlers;
  }
  
  export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void
  ) {
    useEventListener("mousedown", (event) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event as MouseEvent | TouchEvent);
    });
  }
  
  export function useReadLocalStorage<T>(key: string): T | null {
    const readValue = (): T | null => {
      if (typeof window === "undefined") {
        return null;
      }
  
      try {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
      } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return null;
      }
    };
  
    const [storedValue, setStoredValue] = useState<T | null>(readValue);
  
    useEffect(() => {
      setStoredValue(readValue());
    }, []);
  
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
  
    useEventListener("storage", handleStorageChange);
    useEventListener("local-storage", handleStorageChange);
  
    return storedValue;
  }
  
  export function useResizeObserver<T extends HTMLElement>(): [
    (node: T | null) => void,
    ResizeObserverEntry | undefined,
  ] {
    const [entry, setEntry] = useState<ResizeObserverEntry>();
    const [node, setNode] = useState<T | null>(null);
    const observer = useRef<ResizeObserver | null>(null);
  
    const disconnect = useCallback(() => {
      const obs = observer.current;
      obs?.disconnect();
    }, []);
  
    const observe = useCallback(() => {
      observer.current = new ResizeObserver(([entry]) => setEntry(entry));
      if (node) observer.current.observe(node);
    }, [node]);
  
    useIsomorphicLayoutEffect(() => {
      observe();
      return () => disconnect();
    }, [disconnect, observe]);
  
    return [setNode, entry];
  }
  
  export function useScreen(): Screen | undefined {
    const getScreen = () => {
      return typeof window !== "undefined" ? window.screen : undefined;
    };
  
    const [screen, setScreen] = useState<Screen | undefined>(getScreen());
  
    useEffect(() => {
      const handleScreenChange = () => setScreen(getScreen());
  
      window.addEventListener("resize", handleScreenChange);
      return () => window.removeEventListener("resize", handleScreenChange);
    }, []);
  
    return screen;
  }
  
  type ScriptStatus = "idle" | "loading" | "ready" | "error";
  interface ScriptProps {
    src: string;
    checkForExisting?: boolean;
  }
  
  export function useScript({
    src,
    checkForExisting = true,
  }: ScriptProps): ScriptStatus {
    const [status, setStatus] = useState<ScriptStatus>(() => {
      if (!src) return "idle";
      if (checkForExisting && document.querySelector(`script[src="${src}"]`)) {
        return "ready";
      }
      return "loading";
    });
  
    useEffect(() => {
      if (!src) {
        setStatus("idle");
        return;
      }
  
      let script = document.querySelector(
        `script[src="${src}"]`
      ) as HTMLScriptElement | null;
  
      if (!script) {
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.setAttribute("data-status", "loading");
        document.body.appendChild(script);
  
        const setAttributeFromEvent = (event: Event) => {
          script?.setAttribute(
            "data-status",
            event.type === "load" ? "ready" : "error"
          );
        };
  
        script.addEventListener("load", setAttributeFromEvent);
        script.addEventListener("error", setAttributeFromEvent);
      } else {
        setStatus(script.getAttribute("data-status") as ScriptStatus);
      }
  
      const setStateFromEvent = (event: Event) => {
        setStatus(event.type === "load" ? "ready" : "error");
      };
  
      script.addEventListener("load", setStateFromEvent);
      script.addEventListener("error", setStateFromEvent);
  
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent);
          script.removeEventListener("error", setStateFromEvent);
        }
      };
    }, [src]);
  
    return status;
  }
  
  export function useScrollLock(
    lock?: boolean
  ): [boolean, (lock: boolean) => void] {
    const [isLocked, setIsLocked] = useState(lock || false);
    const originalOverflow = useRef<CSSStyleDeclaration["overflow"]>("");
  
    useIsomorphicLayoutEffect(() => {
      if (typeof window === "undefined") return;
  
      originalOverflow.current = window.getComputedStyle(document.body).overflow;
  
      if (isLocked) {
        document.body.style.overflow = "hidden";
      }
  
      return () => {
        document.body.style.overflow = originalOverflow.current;
      };
    }, [isLocked]);
  
    useEffect(() => {
      if (isLocked !== lock) {
        setIsLocked(lock || false);
      }
    }, [lock, isLocked]);
  
    return [isLocked, setIsLocked];
  }
  
  export function useSessionStorage<T>(
    key: string,
    initialValue: T
  ): [T, Setter<T>];
  export function useSessionStorage<T>(
    key: string,
    initialValue?: T
  ): [T | undefined, Setter<T | undefined>];
  export function useSessionStorage<T>(key: string, initialValue?: T) {
    const readValue = useCallback((): T | undefined => {
      if (typeof window === "undefined") {
        return initialValue;
      }
      try {
        const item = window.sessionStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
      } catch (error) {
        console.warn(`Error reading sessionStorage key “${key}”:`, error);
        return initialValue;
      }
    }, [initialValue, key]);
  
    const [storedValue, setStoredValue] = useState<T | undefined>(readValue);
  
    const setValue: Setter<T | undefined> = useEventCallback((value) => {
      if (typeof window == "undefined") {
        console.warn(
          `Tried setting sessionStorage key “${key}” even though environment is not a client`
        );
      }
      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        window.dispatchEvent(new Event("session-storage"));
      } catch (error) {
        console.warn(`Error setting sessionStorage key “${key}”:`, error);
      }
    });
  
    useEffect(() => {
      setStoredValue(readValue());
    }, [readValue]);
  
    const handleStorageChange = useCallback(
      (event: Event) => {
        if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
          return;
        }
        setStoredValue(readValue());
      },
      [key, readValue]
    );
  
    useEventListener("storage", handleStorageChange);
    useEventListener("session-storage", handleStorageChange);
  
    return [storedValue, setValue];
  }
  
  export function useStep(maxStep: number) {
    const [currentStep, setCurrentStep] = useState(1);
  
    const canGoToNextStep = useMemo(
      () => currentStep + 1 <= maxStep,
      [currentStep, maxStep]
    );
  
    const canGoToPrevStep = useMemo(() => currentStep - 1 >= 1, [currentStep]);
  
    const setStep = useCallback(
      (step: number) => {
        if (step >= 1 && step <= maxStep) {
          setCurrentStep(step);
        } else {
          throw new Error("Step not valid");
        }
      },
      [maxStep]
    );
  
    const goToNextStep = useCallback(() => {
      if (canGoToNextStep) {
        setCurrentStep((step) => step + 1);
      }
    }, [canGoToNextStep]);
  
    const goToPrevStep = useCallback(() => {
      if (canGoToPrevStep) {
        setCurrentStep((step) => step - 1);
      }
    }, [canGoToPrevStep]);
  
    const reset = useCallback(() => {
      setCurrentStep(1);
    }, []);
  
    return [
      currentStep,
      {
        goToNextStep,
        goToPrevStep,
        canGoToNextStep,
        canGoToPrevStep,
        setStep,
        reset,
      },
    ];
  }
  
  type TernaryDarkMode = "dark" | "light" | "system";
  interface UseTernaryDarkMode {
    isDarkMode: boolean;
    ternaryDarkMode: TernaryDarkMode;
    setTernaryDarkMode: (mode: TernaryDarkMode) => void;
    toggleTernaryDarkMode: () => void;
  }
  
  export function useTernaryDarkMode(): UseTernaryDarkMode {
    const isDarkOS = useMediaQuery("(prefers-color-scheme: dark)");
    const [ternaryDarkMode, setTernaryDarkMode] =
      useLocalStorage<TernaryDarkMode>("ternary-dark-mode", "system");
    const isDarkMode =
      ternaryDarkMode === "dark" || (ternaryDarkMode === "system" && isDarkOS);
  
    const toggleTernaryDarkMode = () => {
      const modes: TernaryDarkMode[] = ["light", "dark", "system"];
      const next = modes[(modes.indexOf(ternaryDarkMode) + 1) % modes.length];
      setTernaryDarkMode(next);
    };
  
    return {
      isDarkMode,
      ternaryDarkMode,
      setTernaryDarkMode,
      toggleTernaryDarkMode,
    };
  }
  
  export function useTimeout(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);
  
    useIsomorphicLayoutEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      if (delay === null) {
        return;
      }
      const id = setTimeout(() => savedCallback.current(), delay);
      return () => clearTimeout(id);
    }, [delay]);
  }
  
  export function useToggle<T>(
    initialValue: T,
    options: [T, T]
  ): [T, () => void] {
    const [value, setValue] = useState<T>(initialValue);
  
    const toggle = useCallback(() => {
      setValue((prev) => (prev === options[0] ? options[1] : options[0]));
    }, [options]);
  
    return [value, toggle];
  }
  
  export function useUnmount(fn: () => void) {
    const fnRef = useRef(fn);
    fnRef.current = fn;
  
    useEffect(
      () => () => {
        fnRef.current();
      },
      []
    );
  }
  
  interface WindowSize {
    width: number;
    height: number;
  }
  
  export function useWindowSize(): WindowSize {
    const [windowSize, setWindowSize] = useState<WindowSize>({
      width: 0,
      height: 0,
    });
  
    const handleSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
  
    useEventListener("resize", handleSize);
  
    useIsomorphicLayoutEffect(() => {
      handleSize();
    }, []);
  
    return windowSize;
  }
  