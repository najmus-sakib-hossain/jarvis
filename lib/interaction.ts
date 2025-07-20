import { type RefObject, useRef, useCallback, useState, useEffect } from "react";
import { useEventListener } from "@/hooks/use-dx";

type EventHandler<E extends Event> = (event: E) => void;
type EventTargetRef<T> = RefObject<T | null>;
interface Point {
  x: number;
  y: number;
}

const getDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAngle = (p1: Point, p2: Point): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
};

function createHtmlElementInteraction<K extends keyof HTMLElementEventMap>(eventName: K) {
  return <T extends HTMLElement>(ref: EventTargetRef<T>, handler: (event: HTMLElementEventMap[K]) => void) => {
    const eventHandler = useCallback((event: Event) => {
      handler(event as HTMLElementEventMap[K]);
    }, [handler]);
    useEventListener(eventName, eventHandler, ref);
  };
}

function createWindowInteraction<K extends keyof WindowEventMap>(eventName: K) {
  return (handler: (event: WindowEventMap[K]) => void) => {
    const eventHandler = useCallback((event: Event) => {
      handler(event as WindowEventMap[K]);
    }, [handler]);
    useEventListener(eventName, eventHandler);
  };
}

function createDocumentInteraction<K extends keyof DocumentEventMap>(eventName: K) {
  return (handler: (event: DocumentEventMap[K]) => void) => {
    const eventHandler = useCallback((event: Event) => {
      handler(event as DocumentEventMap[K]);
    }, [handler]);
    useEventListener(eventName, eventHandler, { current: document });
  };
}

export const onClick = createHtmlElementInteraction("click");
export const onDoubleClick = createHtmlElementInteraction("dblclick");
export const onRightClick = createHtmlElementInteraction("contextmenu");
export const onMouseDown = createHtmlElementInteraction("mousedown");
export const onMouseUp = createHtmlElementInteraction("mouseup");
export const onMouseMove = createHtmlElementInteraction("mousemove");
export const onMouseEnter = createHtmlElementInteraction("mouseenter");
export const onMouseLeave = createHtmlElementInteraction("mouseleave");

// Added Pointer Events
export const onPointerDown = createHtmlElementInteraction("pointerdown");
export const onPointerUp = createHtmlElementInteraction("pointerup");
export const onPointerMove = createHtmlElementInteraction("pointermove");


export const onDragStart = createHtmlElementInteraction("dragstart");
export const onDrag = createHtmlElementInteraction("drag");
export const onDragEnd = createHtmlElementInteraction("dragend");
export const onDragEnter = createHtmlElementInteraction("dragenter");
export const onDragOver = createHtmlElementInteraction("dragover");
export const onDragLeave = createHtmlElementInteraction("dragleave");
export const onDrop = createHtmlElementInteraction("drop");
export const onWheel = createHtmlElementInteraction("wheel");
export const onPointerLockChange = createDocumentInteraction("pointerlockchange");

export const onTouchStart = createHtmlElementInteraction("touchstart");
export const onTouchMove = createHtmlElementInteraction("touchmove");
export const onTouchEnd = createHtmlElementInteraction("touchend");
export const onTouchCancel = createHtmlElementInteraction("touchcancel");

export const onLongPress = <T extends HTMLElement>(ref: EventTargetRef<T>, handler: (event: TouchEvent) => void, options: { threshold?: number } = {}) => {
  const { threshold = 500 } = options;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((event: TouchEvent) => {
    if (event.touches.length > 1) return;
    timerRef.current = setTimeout(() => handler(event), threshold);
  }, [handler, threshold]);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEventListener("touchstart", (e) => start(e as TouchEvent), ref);
  useEventListener("touchend", clear, ref);
  useEventListener("touchmove", clear, ref);
  useEventListener("touchcancel", clear, ref);
};

export const onSwipe = <T extends HTMLElement>(ref: EventTargetRef<T>, handler: (direction: "up" | "down" | "left" | "right") => void, options: { threshold?: number; timeout?: number } = {}) => {
  const { threshold = 40, timeout = 300 } = options;
  const startPoint = useRef<Point | null>(null);
  const startTime = useRef<number | null>(null);

  const touchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    startPoint.current = { x: touch.clientX, y: touch.clientY };
    startTime.current = Date.now();
  }, []);

  const touchEnd = useCallback((event: TouchEvent) => {
    if (!startPoint.current || !startTime.current) return;
    const endPoint = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    if (Date.now() - startTime.current > timeout) return;

    const deltaX = endPoint.x - startPoint.current.x;
    const deltaY = endPoint.y - startPoint.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) handler(deltaX > 0 ? "right" : "left");
    } else {
      if (Math.abs(deltaY) > threshold) handler(deltaY > 0 ? "down" : "up");
    }
  }, [handler, threshold, timeout]);

  useEventListener("touchstart", (e) => touchStart(e as TouchEvent), ref);
  useEventListener("touchend", (e) => touchEnd(e as TouchEvent), ref);
};

export const onPinch = <T extends HTMLElement>(ref: EventTargetRef<T>, handler: (payload: { scale: number; center: Point }) => void) => {
  const initialDistance = useRef<number | null>(null);

  const touchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2) return;
    const p1 = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    const p2 = { x: event.touches[1].clientX, y: event.touches[1].clientY };
    initialDistance.current = getDistance(p1, p2);
  }, []);

  const touchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2 || !initialDistance.current) return;
    const p1 = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    const p2 = { x: event.touches[1].clientX, y: event.touches[1].clientY };
    const scale = getDistance(p1, p2) / initialDistance.current;
    const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    handler({ scale, center });
  }, [handler]);

  const touchEnd = useCallback(() => {
    initialDistance.current = null;
  }, []);

  useEventListener("touchstart", (e) => touchStart(e as TouchEvent), ref);
  useEventListener("touchmove", (e) => touchMove(e as TouchEvent), ref);
  useEventListener("touchend", touchEnd, ref);
};

export const onRotate = <T extends HTMLElement>(ref: EventTargetRef<T>, handler: (payload: { rotation: number; center: Point }) => void) => {
  const initialAngle = useRef<number | null>(null);

  const touchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2) return;
    const p1 = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    const p2 = { x: event.touches[1].clientX, y: event.touches[1].clientY };
    initialAngle.current = getAngle(p1, p2);
  }, []);

  const touchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2 || initialAngle.current === null) return;
    const p1 = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    const p2 = { x: event.touches[1].clientX, y: event.touches[1].clientY };
    const rotation = getAngle(p1, p2) - initialAngle.current;
    const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    handler({ rotation, center });
  }, [handler]);

  const touchEnd = useCallback(() => {
    initialAngle.current = null;
  }, []);

  useEventListener("touchstart", (e) => touchStart(e as TouchEvent), ref);
  useEventListener("touchmove", (e) => touchMove(e as TouchEvent), ref);
  useEventListener("touchend", touchEnd, ref);
};

export const onKeyDown = createHtmlElementInteraction("keydown");
export const onKeyUp = createHtmlElementInteraction("keyup");

export const onInput = createHtmlElementInteraction("input");
export const onChange = createHtmlElementInteraction("change");
export const onSubmit = createHtmlElementInteraction("submit");
export const onReset = createHtmlElementInteraction("reset");
export const onSelect = createHtmlElementInteraction("select");
export const onInvalid = createHtmlElementInteraction("invalid");
export const onCut = createHtmlElementInteraction("cut");
export const onCopy = createHtmlElementInteraction("copy");
export const onPaste = createHtmlElementInteraction("paste");

export const onResize = createWindowInteraction("resize");
export const onScroll = createHtmlElementInteraction("scroll");
export const onFocus = createHtmlElementInteraction("focus");
export const onBlur = createHtmlElementInteraction("blur");
export const onFullscreenChange = createDocumentInteraction("fullscreenchange");
export const onVisibilityChange = createDocumentInteraction("visibilitychange");
export const onDOMContentLoaded = createDocumentInteraction("DOMContentLoaded");

export const onOrientationChange = createWindowInteraction("orientationchange");
export const onDeviceMotion = createWindowInteraction("devicemotion");
export const onDeviceOrientation = createWindowInteraction("deviceorientation");

export const onPlay = createHtmlElementInteraction("play");
export const onPause = createHtmlElementInteraction("pause");
export const onEnded = createHtmlElementInteraction("ended");
export const onTimeUpdate = createHtmlElementInteraction("timeupdate");
export const onVolumeChange = createHtmlElementInteraction("volumechange");
export const onSeeking = createHtmlElementInteraction("seeking");
export const onSeeked = createHtmlElementInteraction("seeked");
export const onWaiting = createHtmlElementInteraction("waiting");
export const onCanPlayThrough = createHtmlElementInteraction("canplaythrough");

export const onOnline = createWindowInteraction("online");
export const onOffline = createWindowInteraction("offline");
export const onPopState = createWindowInteraction("popstate");
export const onHashChange = createWindowInteraction("hashchange");
export const onStorageChange = createWindowInteraction("storage");
export const onMessage = createWindowInteraction("message");

export const onAnimationStart = createHtmlElementInteraction("animationstart");
export const onAnimationEnd = createHtmlElementInteraction("animationend");
export const onAnimationIteration = createHtmlElementInteraction("animationiteration");
export const onTransitionEnd = createHtmlElementInteraction("transitionend");

export const useGamepad = () => {
  const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([]);
  const animationFrameRef = useRef(0);

  const updateGamepads = useCallback(() => {
    setGamepads(Array.from(navigator.getGamepads ? navigator.getGamepads() : []));
    animationFrameRef.current = requestAnimationFrame(updateGamepads);
  }, []);

  useEffect(() => {
    const handleConnect = () => setGamepads(Array.from(navigator.getGamepads ? navigator.getGamepads() : []));
    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleConnect);
    animationFrameRef.current = requestAnimationFrame(updateGamepads);
    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleConnect);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateGamepads]);

  return gamepads;
};

export const useIdleDetector = () => {
  const [isIdle, setIsIdle] = useState<boolean | null>(null);
  const [isScreenLocked, setIsScreenLocked] = useState<boolean | null>(null);

  useEffect(() => {
    let idleDetector: any;
    const startDetector = async () => {
      if (!("IdleDetector" in window)) return;
      try {
        idleDetector = new (window as any).IdleDetector();
        idleDetector.addEventListener("change", () => {
          setIsIdle(idleDetector.userState === "idle");
          setIsScreenLocked(idleDetector.screenState === "locked");
        });
        await idleDetector.start();
        setIsIdle(idleDetector.userState === "idle");
        setIsScreenLocked(idleDetector.screenState === "locked");
      } catch (e) {
        console.error("IdleDetector failed to start.", e);
      }
    };
    startDetector();
    return () => {
      if (idleDetector?.stop) idleDetector.stop();
    };
  }, []);

  return { isIdle, isScreenLocked };
};

export const useSpeechSynthesis = () => {
  const synth = useRef(window.speechSynthesis);
  const speak = useCallback((text: string, options?: Partial<SpeechSynthesisUtterance>) => {
    if (!synth.current || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (options) Object.assign(utterance, options);
    synth.current.speak(utterance);
  }, []);
  return { speak };
};

export const useShake = (onShake: () => void, options: { threshold?: number; timeout?: number } = {}) => {
  const { threshold = 15, timeout = 1000 } = options;
  const lastShakeTime = useRef(0);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const { x, y, z } = event.accelerationIncludingGravity || {};
    if (x === null || y === null || z === null || !x || !y || !z) return;
    const force = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();
    if (force > threshold && now - lastShakeTime.current > timeout) {
      lastShakeTime.current = now;
      onShake();
    }
  }, [onShake, threshold, timeout]);

  useEventListener("devicemotion", (e) => handleMotion(e as DeviceMotionEvent));
};

export const onFlick = <T extends HTMLElement>(ref: EventTargetRef<T>, handler: (direction: "up" | "down" | "left" | "right", velocity: number) => void, options: { velocityThreshold?: number } = {}) => {
  const { velocityThreshold = 0.7 } = options;
  const startPoint = useRef<Point | null>(null);
  const startTime = useRef<number | null>(null);

  const touchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    startPoint.current = { x: touch.clientX, y: touch.clientY };
    startTime.current = Date.now();
  }, []);

  const touchEnd = useCallback((event: TouchEvent) => {
    if (!startPoint.current || !startTime.current) return;
    const endPoint = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    const deltaTime = Date.now() - startTime.current;
    if (deltaTime === 0) return;

    const distance = getDistance(startPoint.current, endPoint);
    const velocity = distance / deltaTime;

    if (velocity > velocityThreshold) {
      const deltaX = endPoint.x - startPoint.current.x;
      const deltaY = endPoint.y - startPoint.current.y;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        handler(deltaX > 0 ? "right" : "left", velocity);
      } else {
        handler(deltaY > 0 ? "down" : "up", velocity);
      }
    }
  }, [handler, velocityThreshold]);

  useEventListener("touchstart", (e) => touchStart(e as TouchEvent), ref);
  useEventListener("touchend", (e) => touchEnd(e as TouchEvent), ref);
};

export const useTiltToScroll = (options: { multiplier?: number } = {}) => {
  const { multiplier = 5 } = options;
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { beta } = event;
    if (beta !== null) window.scrollBy(0, (beta - 45) * multiplier);
  }, [multiplier]);

  useEventListener("deviceorientation", (e) => handleOrientation(e as DeviceOrientationEvent));
};
