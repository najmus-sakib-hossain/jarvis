"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function HueAnimatedTextarea() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-background">
        <div className="w-full max-w-md space-y-4">
          <header className="text-center">
            <h1 className="text-3xl font-headline font-bold text-foreground">
              Hue Animated Textarea
            </h1>
            <p className="text-muted-foreground font-body">
              Experience a visually engaging textarea with dynamic effects.
            </p>
          </header>

          <div className="space-y-2">
            <Label
              className="text-sm font-medium font-headline text-foreground"
            >
              Your Thoughts Here:
            </Label>
            <div className="glowing-textarea-wrapper rounded-md">
              <Textarea
                placeholder="Type something beautiful..."
                className="w-full h-40 text-base font-body resize-none p-4 focus-visible:ring-0 focus-visible:ring-offset-0 !bg-background"
                aria-label="Hue animated textarea input field"
              />
            </div>
            <p className="text-xs text-muted-foreground font-body text-center pt-1">
              Hover over the textarea to activate the animated gradient glow.
            </p>
          </div>

          <footer className="text-center pt-4">
            <p className="text-xs text-muted-foreground font-body">
              Crafted with Shadcn UI & Tailwind CSS.
            </p>
          </footer>
        </div>
      </main>
      
      {/* THE FIX: The "global" attribute has been removed. 
        This scopes the CSS to this component, ensuring the server and client
        renders match perfectly and fixing the hydration error.
      */}
      <style jsx>{`
        /* Styles for Hue Animated Textarea */
        @keyframes rotateHue {
          0% {
            filter: hue-rotate(0deg) blur(var(--glow-blur));
          }
          100% {
            filter: hue-rotate(360deg) blur(var(--glow-blur));
          }
        }

        @keyframes rotateHueBorder {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        @keyframes white-border-splash {
          0% {
            opacity: 1;
            clip-path: circle(0% at 100% 100%);
          }
          50% {
            opacity: 1;
            clip-path: circle(150% at 100% 100%);
          }
          100% {
            opacity: 0;
            clip-path: circle(150% at 100% 100%);
          }
        }

        .glowing-textarea-wrapper {
          position: relative;
          display: block;
          width: 100%;
          --glow-blur: 15px;
        }

        /* Outer Glow */
        .glowing-textarea-wrapper::before {
          content: "";
          position: absolute;
          inset: -13px;
          z-index: 0;
          border-radius: calc(var(--radius) + 4px);
          background: conic-gradient(
            from 90deg,
            hsl(0, 100%, 65%), hsl(60, 100%, 65%), hsl(120, 100%, 65%),
            hsl(180, 100%, 65%), hsl(240, 100%, 65%), hsl(300, 100%, 65%),
            hsl(0, 100%, 65%)
          );
          animation: rotateHue 4s linear infinite paused;
          filter: blur(var(--glow-blur));
        }

        /* White Splash Border */
        .glowing-textarea-wrapper::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          border-radius: var(--radius);
          border: 2px solid white;
          pointer-events: none;
          clip-path: circle(0% at 100% 100%);
          border-radius: 4px;
        }

        .glowing-textarea-wrapper:hover::before {
          animation-play-state: running;
        }

        .glowing-textarea-wrapper:hover::after {
          animation: white-border-splash 0.5s ease-out forwards;
        }

        .glowing-textarea-wrapper > textarea {
          position: relative;
          z-index: 1;
          width: 100%;
          border-width: 2px;
        }

        .glowing-textarea-wrapper:hover > textarea {
          border-color: transparent !important;
          background-image: linear-gradient(hsl(var(--background)), hsl(var(--background))),
                            conic-gradient(
                              from 90deg,
                              hsl(0, 100%, 65%), hsl(60, 100%, 65%), hsl(120, 100%, 65%),
                              hsl(180, 100%, 65%), hsl(240, 100%, 65%), hsl(300, 100%, 65%),
                              hsl(0, 100%, 65%)
                            );
          background-origin: border-box;
          background-clip: padding-box, border-box;
          animation: rotateHueBorder 4s linear infinite;
        }
      `}</style>
    </>
  );
}