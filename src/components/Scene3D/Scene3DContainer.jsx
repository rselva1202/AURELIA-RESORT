import React, { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import VarkalaScene from './VarkalaScene'

function checkWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}

export default function Scene3DContainer({
  scrollProgressRef,
  enabled = true,
  qualitySetting = 'auto',
  reducedMotion = false,
  onSceneReady,
}) {
  const [hasWebGL, setHasWebGL] = useState(true)
  const [isTabVisible, setIsTabVisible] = useState(true)

  // WebGL availability check
  useEffect(() => {
    const supported = checkWebGL()
    setHasWebGL(supported)
  }, [])

  // Tab visibility listener to pause rendering when backgrounded
  useEffect(() => {
    const onVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // Determine effective quality ('high' or 'low')
  const effectiveQuality = useMemo(() => {
    if (qualitySetting === 'low') return 'low'
    if (qualitySetting === 'high') return 'high'
    // 'auto' heuristic
    if (typeof window === 'undefined') return 'high'
    const isMobileWidth = window.innerWidth < 768
    const cores = navigator.hardwareConcurrency || 4
    const mem = navigator.deviceMemory || 4
    if (isMobileWidth || cores <= 4 || mem <= 4) {
      return 'low'
    }
    return 'high'
  }, [qualitySetting])

  // Pixel ratio capping (max 1.5 on desktop, 1 on mobile)
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1
    const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)
    if (isMobile) return 1
    return Math.min(1.5, window.devicePixelRatio || 1)
  }, [])

  // Fallback conditions
  if (!enabled || !hasWebGL || reducedMotion || qualitySetting === 'off') {
    return null
  }

  return (
    <div
      className="scene-3d-wrapper"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <Canvas
        className="scene-3d-canvas"
        frameloop={isTabVisible ? 'always' : 'never'}
        dpr={dpr}
        gl={{
          powerPreference: 'high-performance',
          antialias: effectiveQuality !== 'low',
          depth: true,
          stencil: false,
          alpha: true,
        }}
        camera={{ position: [0, 4.6, 12], fov: 52, near: 0.1, far: 180 }}
        onCreated={() => {
          if (onSceneReady) onSceneReady()
        }}
      >
        <VarkalaScene
          quality={effectiveQuality}
          scrollProgressRef={scrollProgressRef}
        />
      </Canvas>
    </div>
  )
}
