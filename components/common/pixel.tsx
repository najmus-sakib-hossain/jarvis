"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export const PixelatedText = React.memo<PixelatedTextProps>(({ children, fontSize = 30, pixelSize = 4, position = "left", className = "" }) => {
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current) return
    
    // Rest of your canvas logic here
  }, [children, fontSize, pixelSize, mounted])

  // Return null during SSR
  if (!mounted) return null

  return (
    <canvas
      ref={canvasRef}
      className={cn("inline-block", className)}
      style={{ 
        imageRendering: 'pixelated',
        display: 'inline-block'
      }}
    />
  )
})

PixelatedText.displayName = "PixelatedText"

interface PixelatedTextProps {
  children: React.ReactNode;
  className?: string;
  fontSize?: number;
  pixelSize?: number;
  textColor?: string;
  position?: 'left' | 'center' | 'right';
}

interface RainbowPixelatedTextProps {
  children: string;
  className?: string;
}

const PixelContext = React.createContext<{
  fontSize: number;
  pixelSize: number;
}>({
  fontSize: 30,
  pixelSize: 4,
});

const measureText = (text: string, fontSize: number) => {
  if (typeof window === 'undefined') {
    // Return fixed dimensions for SSR
    return {
      width: 0,
      height: 0
    }
  }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return { width: 0, height: 0 }
  
  ctx.font = `bold ${fontSize}px monospace`
  const metrics = ctx.measureText(text)
  
  return {
    width: Math.ceil(metrics.width),
    height: Math.ceil(fontSize)
  }
};

const BasePixelatedText: React.FC<RainbowPixelatedTextProps> = ({
  children,
  className,
}) => {
  const { theme } = useTheme();
  const { fontSize, pixelSize } = React.useContext(PixelContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = measureText(children, fontSize);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use theme from next-themes to determine text color
    const textColor = theme === 'dark' ? '#ffffff' : '#000000';

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textBaseline = 'middle';
    
    const x = 0;
    const y = canvasSize.height / 2;
    
    ctx.fillText(children, x, y);

    const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    const data = imageData.data;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    for (let y = 0; y < canvasSize.height; y += pixelSize) {
      for (let x = 0; x < canvasSize.width; x += pixelSize) {
        const index = y * canvasSize.width * 4 + x * 4;
        if (data[index + 3] > 0) {
          ctx.fillStyle = textColor;
          ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
        }
      }
    }
  }, [children, fontSize, pixelSize, canvasSize.width, canvasSize.height, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={cn('inline-block align-middle', className)}
      style={{ 
        imageRendering: 'pixelated',
        width: 'min-content', // Changed from 100% to min-content
        height: `${canvasSize.height}px` // Keep original text height
      }}
    />
  );
};

const RainbowPixelatedText: React.FC<RainbowPixelatedTextProps> = ({
  children,
  className,
}) => {
  const [hue, setHue] = useState(0);
  const { fontSize, pixelSize } = React.useContext(PixelContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Calculate dimensions on each render
  const canvasSize = measureText(children, fontSize);

  // Rainbow animation effect
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setHue(prev => (prev + 1) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Canvas rendering effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textBaseline = 'middle';
    
    const textMetrics = ctx.measureText(children);
    const x = 0;
    const y = canvasSize.height / 2;
    
    ctx.fillText(children, x, y);

    const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    const data = imageData.data;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    for (let y = 0; y < canvasSize.height; y += pixelSize) {
      for (let x = 0; x < canvasSize.width; x += pixelSize) {
        const index = y * canvasSize.width * 4 + x * 4;
        if (data[index + 3] > 0) {
          const pixelHue = (hue + (x / canvasSize.width) * 360) % 360;
          ctx.fillStyle = `hsl(${pixelHue}, 100%, 50%)`;
          ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
        }
      }
    }
  }, [children, fontSize, pixelSize, hue, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={cn('inline-block align-middle', className)}
      style={{ 
        imageRendering: 'pixelated',
        width: 'min-content', // Changed from 100% to min-content
        height: `${canvasSize.height}px` // Keep original text height
      }}
    />
  );
};

const PixelatedTextComponent: React.FC<PixelatedTextProps> & {
  Rainbow: typeof RainbowPixelatedText;
} = ({
  children,
  className,
  fontSize = 30,
  pixelSize = 4,
  textColor = 'white',
  position = 'left',
}) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // or a loading placeholder
  }

  return (
    <PixelContext.Provider value={{ fontSize, pixelSize }}>
      <div 
        className={cn(
          'inline-flex w-min items-center gap-0', // Changed flex to inline-flex and added w-min
          position === 'center' && 'justify-center',
          position === 'right' && 'justify-end',
          className
        )}
      >
        {React.Children.map(children, child => {
          if (typeof child === 'string') {
            return <BasePixelatedText>{child}</BasePixelatedText>;
          }
          return child;
        })}
      </div>
    </PixelContext.Provider>
  );
};

PixelatedTextComponent.Rainbow = RainbowPixelatedText;

export default PixelatedTextComponent;