
"use client";

import type { CSSProperties } from 'react';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface EmojiParticleProps {
  id: string | number;
  dataUri: string; // Changed from imageDataUri to dataUri to match usage
  x: number;
  y: number;
  speedFactor: number;
  onComplete: (id: string | number) => void;
}

const EMOJI_ANIMATION_BASE_DURATION = 700;
const BASE_GIF_SIZE = 40; // Base size for GIFs in pixels

export const EmojiParticle: React.FC<EmojiParticleProps> = ({ id, dataUri, x, y, speedFactor, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  const animationDuration = EMOJI_ANIMATION_BASE_DURATION / Math.max(0.5, speedFactor);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete(id);
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [id, onComplete, animationDuration]);

  const [animParams] = useState(() => ({
    translateXStart: `${(Math.random() - 0.5) * 5 * (1 + speedFactor * 0.2)}px`,
    translateYStart: `${(Math.random() - 0.5) * 5 * (1 + speedFactor * 0.2)}px`,
    scaleStart: 0.4 + speedFactor * 0.1,
    rotateStart: `${(Math.random() - 0.5) * 15 * (1 + speedFactor * 0.1)}deg`,

    translateXMid: `${(Math.random() - 0.5) * 25 * (1 + speedFactor * 0.5)}px`,
    translateYMid: `-${40 + speedFactor * 25}px`, // Adjusted to move upwards more
    scaleMid: 1.0 + speedFactor * 0.4,
    rotateMid: `${(Math.random() - 0.5) * 30 * (1 + speedFactor * 0.4)}deg`,

    translateXEnd: `${(Math.random() - 0.5) * 35 * (1 + speedFactor * 0.8)}px`,
    translateYEnd: `-${70 + speedFactor * 40}px`, // Adjusted to move further upwards
    scaleEnd: Math.max(0.1, 0.2 - speedFactor * 0.05), 
    rotateEnd: `${(Math.random() - 0.5) * 45 * (1 + speedFactor * 0.5)}deg`,
  }));

  if (!isVisible) {
    return null;
  }

  const currentGifSize = BASE_GIF_SIZE * (0.8 + speedFactor * 0.2);

  const style: CSSProperties = {
    left: `${x}px`, // x and y are now relative to the container, so centering is done via transform
    top: `${y}px`,
    width: `${currentGifSize}px`,
    height: `${currentGifSize}px`,
    position: 'absolute',
    userSelect: 'none',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)', // Center the GIF at the (x, y) point
    '--emoji-duration': `${animationDuration}ms`,
    
    '--emoji-translate-x-start': animParams.translateXStart,
    '--emoji-translate-y-start': animParams.translateYStart,
    '--emoji-scale-start': animParams.scaleStart,
    '--emoji-rotate-start': animParams.rotateStart,

    '--emoji-translate-x-mid': animParams.translateXMid,
    '--emoji-translate-y-mid': animParams.translateYMid,
    '--emoji-scale-mid': animParams.scaleMid,
    '--emoji-rotate-mid': animParams.rotateMid,

    '--emoji-translate-x-end': animParams.translateXEnd,
    '--emoji-translate-y-end': animParams.translateYEnd,
    '--emoji-scale-end': animParams.scaleEnd,
    '--emoji-rotate-end': animParams.rotateEnd,
  } as CSSProperties;


  return (
    <div style={style} className="emoji-particle-gif"> 
      <Image src={dataUri} alt="typing effect" width={currentGifSize} height={currentGifSize} unoptimized />
    </div>
  );
};
