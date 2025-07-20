"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

const FRIDAY_ANIMATION_Z_INDEX = 9990;

export function Friday() {
    const [hasMounted, setHasMounted] = useState(false);

    const [isEffectEnabled, setIsEffectEnabled] = useState(false);
    const [littleScrollAmount, setLittleScrollAmount] = useState(0);

    const fridayTopRef = useRef<HTMLDivElement>(null);
    const fridayBottomRef = useRef<HTMLDivElement>(null);
    const fridayLeftRef = useRef<HTMLDivElement>(null);
    const fridayRightRef = useRef<HTMLDivElement>(null);
    const glassDivRef = useRef<HTMLDivElement | null>(null);
    const initialScrollY = useRef(0);

    const slideAnimationDuration = 750;

    useEffect(() => {
        setHasMounted(true);
        setLittleScrollAmount(window.innerHeight * 0.1);
    }, []);


    const springScrollTo = useCallback((targetY: number, onComplete?: () => void) => {
        if (typeof window === 'undefined') return;
        let currentY = window.scrollY;
        let scrollVelocity = 0;
        const stiffness = 0.03;
        const damping = 0.20;
        const mass = 1;

        function animateSpringFrame() {
            const displacement = targetY - currentY;
            const springForce = displacement * stiffness;
            const dampingForce = -scrollVelocity * damping;
            const acceleration = (springForce + dampingForce) / mass;

            scrollVelocity += acceleration;
            currentY += scrollVelocity;

            window.scrollTo(0, currentY);

            const isSettled = Math.abs(currentY - targetY) < 0.5 && Math.abs(scrollVelocity) < 0.5;
            if (!isSettled) {
                requestAnimationFrame(animateSpringFrame);
            } else {
                window.scrollTo(0, targetY);
                scrollVelocity = 0;
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(animateSpringFrame);
    }, []);

    const animatedScroll = useCallback((to: number, duration: number, onComplete?: () => void) => {
        if (typeof window === 'undefined') return;
        const start = window.scrollY;
        const change = to - start;
        let startTime: number | null = null;

        function animateScrollFrame(currentTime: number) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            let progress = Math.min(timeElapsed / duration, 1);

            const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            window.scrollTo(0, start + change * easeInOutQuad(progress));

            if (progress < 1) {
                requestAnimationFrame(animateScrollFrame);
            } else {
                window.scrollTo(0, to);
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(animateScrollFrame);
    }, []);


    const toggleFridayEffect = useCallback(() => {
        setIsEffectEnabled(prev => !prev);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || littleScrollAmount === 0) return;

        const allFridayElements = [
            fridayTopRef.current,
            fridayBottomRef.current,
            fridayLeftRef.current,
            fridayRightRef.current,
        ].filter(el => el !== null) as HTMLDivElement[];

        if (isEffectEnabled) {
            document.body.classList.add('friday-effect-enabled');
            allFridayElements.forEach(el => el.classList.remove('visible'));

            initialScrollY.current = window.scrollY;

            if (fridayBottomRef.current) fridayBottomRef.current.classList.add('visible');

            setTimeout(() => {
                if (fridayRightRef.current) fridayRightRef.current.classList.add('visible');
                setTimeout(() => {
                    if (fridayLeftRef.current) fridayLeftRef.current.classList.add('visible');
                }, 150);
            }, slideAnimationDuration / 2);

            if (!glassDivRef.current) {
                const newGlassDiv = document.createElement('div');
                newGlassDiv.className = 'glass-effect-div';
                newGlassDiv.style.animation =
                    `slideUp ${slideAnimationDuration / 1000}s ease-out forwards, ` +
                    `animate-sides 10s linear infinite`;
                document.body.appendChild(newGlassDiv);
                glassDivRef.current = newGlassDiv;
                void newGlassDiv.offsetWidth;

                const targetScrollDown = initialScrollY.current + littleScrollAmount;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                animatedScroll(Math.min(targetScrollDown, maxScroll), slideAnimationDuration * 0.9);

                const handleAnimationEnd = (event: AnimationEvent) => {
                    if (event.animationName === 'slideUp') {
                        if (glassDivRef.current && glassDivRef.current.parentNode) {
                            glassDivRef.current.remove();
                            glassDivRef.current = null;
                        }
                        if (fridayTopRef.current) fridayTopRef.current.classList.add('visible');

                        const jiggleAmount = 30;
                        springScrollTo(initialScrollY.current, () => {
                            springScrollTo(initialScrollY.current - jiggleAmount, () => {
                                springScrollTo(initialScrollY.current);
                            });
                        });
                        newGlassDiv.removeEventListener('animationend', handleAnimationEnd);
                    }
                };
                newGlassDiv.addEventListener('animationend', handleAnimationEnd);
            }

        } else {
            document.body.classList.remove('friday-effect-enabled');
            allFridayElements.forEach(el => el.classList.remove('visible'));
            if (glassDivRef.current && glassDivRef.current.parentNode) {
                glassDivRef.current.remove();
                glassDivRef.current = null;
            }
        }
    }, [isEffectEnabled, animatedScroll, springScrollTo, littleScrollAmount, slideAnimationDuration]);

    if (!hasMounted) {
        return null;
    }

    const renderSpans = () =>
        Array.from({ length: 25 }).map((_, i) => (
            <span key={i} style={{ '--i': i + 1 } as React.CSSProperties}></span>
        ));

    return (
        <>
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[10001]">
                <Button onClick={toggleFridayEffect} variant="outline" className="shadow-lg bg-green-500 hover:bg-green-600 text-white">
                    {isEffectEnabled ? "Deactivate Friday" : "Activate Friday"}
                </Button>
            </div>

            <div ref={fridayTopRef} className="friday-top transition-all">{renderSpans()}</div>
            <div ref={fridayBottomRef} className="friday-bottom transition-all">{renderSpans()}</div>
            <div ref={fridayLeftRef} className="friday-left transition-all">{renderSpans()}</div>
            <div ref={fridayRightRef} className="friday-right transition-all">{renderSpans()}</div>

            <style jsx global>{`
        .friday-effect-enabled {
          /* Used for body-level changes if needed */
        }

        .friday-top,
        .friday-bottom,
        .friday-left,
        .friday-right {
          position: fixed;
          width: 100%;
          display: flex;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.5s ease-in-out, visibility 0s linear 0.5s;
          z-index: ${FRIDAY_ANIMATION_Z_INDEX - 1};
          --friday-span-bg: #0f0;
          --friday-glow-color1: #48ff00;
          --friday-glow-color2: #0f0;
        }

        .friday-top.visible,
        .friday-bottom.visible,
        .friday-left.visible,
        .friday-right.visible {
          opacity: 1;
          visibility: visible;
          transition: opacity 0.5s ease-in-out, visibility 0s linear 0s;
        }

        .friday-top {
          top: -9rem;
          left: 0;
        }

        .friday-bottom {
          bottom: -9rem;
          left: 0;
        }

        .friday-left {
          top: calc(50vh - 5px);
          right: calc(-30px - 50vh);
          height: 10px;
          width: 100vh;
          transform: rotate(90deg);
          transform-origin: 50% 50%;
        }

        .friday-right {
          top: calc(50vh - 5px);
          left: calc(-20px - 50vh);
          height: 10px;
          width: 100vh;
          transform: rotate(90deg);
          transform-origin: 50% 50%;
        }

        .friday-top span,
        .friday-bottom span {
          position: relative;
          height: 21vh;
          width: 4vw;
        }

        .friday-left span,
        .friday-right span {
          position: relative;
          height: 2vh;
          width: 4%;
        }

        .friday-top span::before,
        .friday-bottom span::before,
        .friday-left span::before,
        .friday-right span::before {
          content: "";
          position: absolute;
          animation-delay: calc(var(--i)*0.1s);
          background: var(--friday-span-bg);
          top: -9px;
          bottom: -9px;
          left: -5px;
          right: -5px;
          box-shadow:
            0 0 4px var(--friday-glow-color1),
            0 0 12px var(--friday-glow-color2),
            0 0 25px var(--friday-glow-color2),
            0 0 40px var(--friday-glow-color2);
          transform: rotate(90deg);
        }

        .friday-top span::before,
        .friday-bottom span::before {
          animation: animate-top-bottom 10s linear infinite;
        }

        .friday-left span::before,
        .friday-right span::before {
            animation: animate-sides 10s linear infinite;
        }

        @keyframes animate-top-bottom {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        @keyframes animate-sides {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        .glass-effect-div {
          position: fixed;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 0;
          background: hsl(var(--background)/0.50);
          backdrop-filter: blur( 20px );
          -webkit-backdrop-filter: blur( 20px );
          z-index: ${FRIDAY_ANIMATION_Z_INDEX};
        }

        @keyframes slideUp {
          0% {
            height: 0;
            bottom: 0;
          }
          100% {
            height: 100vh;
            bottom: 0;
          }
        }
      `}</style>
        </>
    );
}
