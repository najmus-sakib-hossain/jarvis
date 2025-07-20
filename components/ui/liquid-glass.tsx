"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const smoothStep = (a: number, b: number, t: number): number => {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const length = (x: number, y: number): number => {
  return Math.sqrt(x * x + y * y)
}

const roundedRectSDF = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): number => {
  const qx = Math.abs(x) - width + radius
  const qy = Math.abs(y) - height + radius
  return (
    Math.min(Math.max(qx, qy), 0) +
    length(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
  )
}

interface UV {
  x: number
  y: number
}

// Created by manfromexistence - https://x.com/manfrexistence
export const LiquidGlass = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1)
  const [height, setHeight] = useState(1)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    setWidth(element.offsetWidth)
    setHeight(element.offsetHeight)

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect
        setWidth(width)
        setHeight(height)
      }
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const feImageRef = useRef<SVGFEImageElement | null>(null)
  const feDisplacementMapRef = useRef<SVGFEDisplacementMapElement | null>(null)

  const filterId = useRef(
    "liquid-glass-" + Math.random().toString(36).slice(2, 11)
  )

  const [distortWidth] = useState(0.3)
  const [distortHeight] = useState(0.2)
  const [distortRadius] = useState(0.6)
  const [smoothStepEdge] = useState(0.8)
  const [distanceOffset] = useState(0.15)

  const updateShader = useCallback(() => {
    if (
      !canvasRef.current ||
      !feImageRef.current ||
      !feDisplacementMapRef.current ||
      width <= 1 ||
      height <= 1
    )
      return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const canvasDPI = 1
    const w = Math.floor(width * canvasDPI)
    const h = Math.floor(height * canvasDPI)
    if (w <= 0 || h <= 0) return;

    canvas.width = w;
    canvas.height = h;

    const data = new Uint8ClampedArray(w * h * 4)
    let maxScale = 0
    const rawValues: number[] = []

    const fragment = (uv: UV) => {
      const ix = uv.x - 0.5
      const iy = uv.y - 0.5
      const distanceToEdge = roundedRectSDF(
        ix,
        iy,
        distortWidth,
        distortHeight,
        distortRadius
      )
      const displacement = smoothStep(
        smoothStepEdge,
        0,
        distanceToEdge - distanceOffset
      )
      const scaled = smoothStep(0, 1, displacement)
      return { x: ix * scaled + 0.5, y: iy * scaled + 0.5 }
    }

    for (let i = 0; i < w * h; i++) {
      const x = i % w
      const y = Math.floor(i / w)
      const pos = fragment({ x: x / w, y: y / h })
      const dx = pos.x * w - x
      const dy = pos.y * h - y
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
      rawValues.push(dx, dy)
    }

    maxScale *= 0.5

    let dataIndex = 0
    let rawValueIndex = 0
    for (let i = 0; i < w * h; i++) {
      const r = rawValues[rawValueIndex++] / maxScale + 0.5
      const g = rawValues[rawValueIndex++] / maxScale + 0.5
      data[dataIndex++] = r * 255
      data[dataIndex++] = g * 255
      data[dataIndex++] = 0
      data[dataIndex++] = 255
    }

    context.putImageData(new ImageData(data, w, h), 0, 0)

    feImageRef.current.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      canvas.toDataURL()
    )
    feDisplacementMapRef.current.setAttribute(
      "scale",
      (maxScale / canvasDPI).toString()
    )
  }, [
    width,
    height,
    distortWidth,
    distortHeight,
    distortRadius,
    smoothStepEdge,
    distanceOffset,
  ])

  useEffect(() => {
    updateShader()
  }, [updateShader])

  return (
    <>
      <svg
        width="0"
        height="0"
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <defs>
          <filter
            id={filterId.current}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            x="0"
            y="0"
            width={width}
            height={height}
          >
            <feImage
              ref={feImageRef}
              width={width}
              height={height}
              result={filterId.current + "_map"}
            />
            <feDisplacementMap
              ref={feDisplacementMapRef}
              in="SourceGraphic"
              in2={filterId.current + "_map"}
              xChannelSelector="R"
              yChannelSelector="G"
              scale="0"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        style={{
          filter:
            `url(#${filterId.current}) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1)`,
          boxShadow:
            "0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15)",
        }}
        className={cn(
          "flex h-64 w-64 items-center justify-center rounded-full border",
          className
        )}
        {...props}
      >
        {children}
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "none" }}
      />
    </>
  )
}
