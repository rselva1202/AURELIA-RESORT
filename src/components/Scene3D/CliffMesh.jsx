import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Procedural palm tree component
function PalmTree({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) {
  const trunkCurve = useMemo(() => {
    return [
      [0, 0, 0],
      [0.08, 0.7, 0.05],
      [0.2, 1.4, 0.12],
      [0.35, 2.1, 0.22],
    ]
  }, [])

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Trunk segments */}
      {trunkCurve.map((pos, idx) => (
        <mesh key={idx} position={pos} rotation={[0.08 * idx, 0, -0.06 * idx]}>
          <cylinderGeometry args={[0.07 - idx * 0.012, 0.09 - idx * 0.012, 0.75, 5]} />
          <meshStandardMaterial color="#4A2E1F" roughness={0.9} flatShading />
        </mesh>
      ))}

      {/* Palm fronds / crown */}
      <group position={[0.4, 2.45, 0.26]}>
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
          <group key={idx} rotation={[0.4, (angle * Math.PI) / 180, -0.2]}>
            <mesh position={[0, -0.2, 0.65]} rotation={[-Math.PI / 4, 0, 0]}>
              <coneGeometry args={[0.26, 1.2, 4]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#1E4A35' : '#2A6348'} roughness={0.7} flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function CliffMesh({ quality = 'high', scrollProgressRef }) {
  const cliffRef = useRef()
  const lanternLightRef = useRef()

  // Procedural low-poly cliff geometry
  const cliffGeometry = useMemo(() => {
    const segments = quality === 'low' ? [8, 5, 10] : [16, 10, 20]
    const geom = new THREE.BoxGeometry(18, 12, 32, segments[0], segments[1], segments[2])
    const pos = geom.attributes.position

    // Displace vertices to create stylized rugged cliff terraces
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)

      // Only displace outer coastal facade
      const noise1 = Math.sin(x * 0.6) * Math.cos(z * 0.4) * 0.8
      const noise2 = Math.sin((x + z) * 0.9) * 0.45
      const terrace = Math.floor(y * 0.8) * 0.35

      // Jagged cliff overhang
      const displacement = (noise1 + noise2 + terrace) * (y > -2 ? 1.0 : 0.4)
      pos.setX(i, x + displacement * 0.5)
      pos.setY(i, y + Math.cos(x * 0.7) * 0.3)
      pos.setZ(i, z + displacement * 0.6)
    }

    geom.computeVertexNormals()
    return geom
  }, [])

  // Material with laterite red-orange base
  const cliffMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#9E4322'), // Laterite red-orange
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    })
  }, [])

  // Palm locations along the cliff crest
  const palms = useMemo(() => {
    const list = [
      { pos: [5.2, 4.3, 4.5], scale: 1.1, rot: [0.05, 0.2, -0.05] },
      { pos: [6.5, 4.2, 1.2], scale: 0.95, rot: [-0.04, 0.8, -0.08] },
      { pos: [4.8, 4.4, -2.5], scale: 1.2, rot: [0.02, 1.4, -0.04] },
      { pos: [7.2, 4.0, -6.8], scale: 1.05, rot: [-0.06, 0.4, -0.06] },
      { pos: [5.6, 4.3, -11.0], scale: 0.9, rot: [0.03, 1.9, -0.05] },
    ]
    return quality === 'low' ? list.slice(0, 2) : list
  }, [quality])

  useFrame(() => {
    const p = scrollProgressRef?.current || 0

    // Laterite color shifts slightly warmer during sunset, deeper at night
    if (cliffRef.current) {
      if (p < 0.65) {
        cliffRef.current.material.color.set('#9E4322')
      } else if (p < 0.85) {
        const t = (p - 0.65) / 0.20
        cliffRef.current.material.color.lerpColors(new THREE.Color('#9E4322'), new THREE.Color('#782B14'), t)
      } else {
        const t = (p - 0.85) / 0.15
        cliffRef.current.material.color.lerpColors(new THREE.Color('#782B14'), new THREE.Color('#381B15'), t)
      }
    }

    // Warm lantern point light glow at night
    if (lanternLightRef.current) {
      if (p > 0.82) {
        const nightFactor = Math.min(1.0, (p - 0.82) / 0.15)
        lanternLightRef.current.intensity = nightFactor * 2.8
      } else {
        lanternLightRef.current.intensity = 0
      }
    }
  })

  return (
    <group position={[12, 1.5, -8]}>
      <mesh
        ref={cliffRef}
        geometry={cliffGeometry}
        material={cliffMaterial}
      />

      {/* Palms along cliff rim */}
      {palms.map((p, idx) => (
        <PalmTree key={idx} position={p.pos} scale={p.scale} rotation={p.rot} />
      ))}

      {/* Lantern light for nighttime */}
      <pointLight
        ref={lanternLightRef}
        position={[4.6, 5.2, 2.0]}
        color="#F4A261"
        intensity={0}
        distance={24}
        decay={2}
      />
    </group>
  )
}
