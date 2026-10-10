import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import OceanMesh from './OceanMesh'
import CliffMesh from './CliffMesh'
import SkyDome from './SkyDome'

export default function VarkalaScene({ quality = 'high', scrollProgressRef }) {
  const { camera, scene } = useThree()
  const mouseOffset = useRef({ x: 0, y: 0 })
  const currentLookAt = useRef(new THREE.Vector3(0, 1.5, -20))

  // Camera waypoints along the scroll narrative
  const waypoints = useMemo(() => [
    { p: 0.00, pos: new THREE.Vector3(0.0, 4.6, 12.0), look: new THREE.Vector3(0.0, 1.4, -20.0) }, // Hero: High cliff overview
    { p: 0.15, pos: new THREE.Vector3(1.5, 4.2, 9.5),  look: new THREE.Vector3(-0.5, 1.2, -18.0) },
    { p: 0.40, pos: new THREE.Vector3(3.2, 3.6, 5.5),  look: new THREE.Vector3(-1.2, 0.9, -15.0) }, // About: Along cliff edge
    { p: 0.65, pos: new THREE.Vector3(1.0, 1.6, 3.2),  look: new THREE.Vector3(0.0, 0.5, -14.0) },  // Rooms: Dipping to sea level
    { p: 0.85, pos: new THREE.Vector3(-1.8, 2.6, 4.8), look: new THREE.Vector3(0.2, 0.4, -22.0) },  // Sunset: Glancing west
    { p: 1.00, pos: new THREE.Vector3(0.0, 3.4, 7.0),  look: new THREE.Vector3(0.0, 1.0, -16.0) },  // Night: Calm sea & stars
  ], [])

  // Fog colors matching scroll progress
  const fogColors = useMemo(() => ({
    hero: new THREE.Color('#1F6370'),
    about: new THREE.Color('#257180'),
    rooms: new THREE.Color('#1C6170'),
    sunset: new THREE.Color('#8C3428'),
    night: new THREE.Color('#061A24'),
  }), [])

  // Setup initial fog
  useMemo(() => {
    scene.fog = new THREE.FogExp2('#1F6370', 0.016)
  }, [scene])

  // Mouse move listener for desktop-only subtle parallax sway
  useMemo(() => {
    if (typeof window === 'undefined') return
    const onMouseMove = (e) => {
      if (window.innerWidth < 980) return
      mouseOffset.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4
      mouseOffset.current.y = (e.clientY / window.innerHeight - 0.5) * -0.25
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame((state, delta) => {
    const p = Math.max(0, Math.min(1, scrollProgressRef?.current || 0))

    // Find the two bounding waypoints for current p
    let idx = 0
    while (idx < waypoints.length - 1 && waypoints[idx + 1].p <= p) {
      idx++
    }
    const w1 = waypoints[idx]
    const w2 = waypoints[Math.min(waypoints.length - 1, idx + 1)]
    const span = Math.max(0.0001, w2.p - w1.p)
    const t = Math.max(0, Math.min(1, (p - w1.p) / span))

    // Smooth spline-like hermite interpolation
    const smoothT = t * t * (3 - 2 * t)

    const targetPos = new THREE.Vector3().lerpVectors(w1.pos, w2.pos, smoothT)
    const targetLook = new THREE.Vector3().lerpVectors(w1.look, w2.look, smoothT)

    // Add small mouse parallax offset (damped) on desktop
    if (window.innerWidth >= 980) {
      targetPos.x += mouseOffset.current.x
      targetPos.y += mouseOffset.current.y
    }

    // Damped camera motion
    const dampSpeed = Math.min(delta * 4.5, 0.3)
    camera.position.lerp(targetPos, dampSpeed)
    currentLookAt.current.lerp(targetLook, dampSpeed)
    camera.lookAt(currentLookAt.current)

    // Update scene fog color
    if (scene.fog) {
      let fogCol = fogColors.hero
      if (p < 0.40) {
        const factor = (p - 0.15) / 0.25
        fogCol = new THREE.Color().lerpColors(fogColors.hero, fogColors.about, Math.max(0, factor))
      } else if (p < 0.65) {
        const factor = (p - 0.40) / 0.25
        fogCol = new THREE.Color().lerpColors(fogColors.about, fogColors.rooms, factor)
      } else if (p < 0.85) {
        const factor = (p - 0.65) / 0.20
        fogCol = new THREE.Color().lerpColors(fogColors.rooms, fogColors.sunset, factor)
      } else {
        const factor = (p - 0.85) / 0.15
        fogCol = new THREE.Color().lerpColors(fogColors.sunset, fogColors.night, factor)
      }
      scene.fog.color.lerp(fogCol, dampSpeed)
    }
  })

  return (
    <>
      <ambientLight intensity={0.45} />
      <SkyDome quality={quality} scrollProgressRef={scrollProgressRef} />
      <OceanMesh quality={quality} scrollProgressRef={scrollProgressRef} />
      <CliffMesh quality={quality} scrollProgressRef={scrollProgressRef} />
    </>
  )
}
