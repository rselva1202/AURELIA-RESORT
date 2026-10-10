import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const skyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const skyFragmentShader = `
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  uniform vec3 uHorizonColor;
  uniform float uOffset;
  uniform float uExponent;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = max(0.0, dir.y + uOffset);
    float factor = pow(h, uExponent);
    
    // Horizon blend
    float horizonMix = smoothstep(0.0, 0.25, h);
    vec3 col = mix(uHorizonColor, mix(uBottomColor, uTopColor, factor), horizonMix);
    
    gl_FragColor = vec4(col, 1.0);
  }
`

export default function SkyDome({ quality = 'high', scrollProgressRef }) {
  const skyRef = useRef()
  const sunMeshRef = useRef()
  const sunLightRef = useRef()
  const starsRef = useRef()

  // Sky shader uniforms
  const skyUniforms = useMemo(() => ({
    uTopColor: { value: new THREE.Color('#0A333E') },
    uBottomColor: { value: new THREE.Color('#1F6370') },
    uHorizonColor: { value: new THREE.Color('#7FC8C0') },
    uOffset: { value: 0.12 },
    uExponent: { value: 0.65 },
  }), [])

  // 5 Color states for sky gradient
  const skyColors = useMemo(() => ({
    // Hero: Morning Teal / Cyan
    hero: { top: new THREE.Color('#0A333E'), bottom: new THREE.Color('#16525F'), horizon: new THREE.Color('#78C4BC') },
    // About: Coastal Daylight
    about: { top: new THREE.Color('#0F414F'), bottom: new THREE.Color('#257180'), horizon: new THREE.Color('#94DDD5') },
    // Rooms: Midday Turquoise
    rooms: { top: new THREE.Color('#0B3844'), bottom: new THREE.Color('#1C6170'), horizon: new THREE.Color('#82CEC6') },
    // Sunset: Coral & Purple
    sunset: { top: new THREE.Color('#381836'), bottom: new THREE.Color('#8C3428'), horizon: new THREE.Color('#F4906F') },
    // Night: Deep Starlit Indigo
    night: { top: new THREE.Color('#02090F'), bottom: new THREE.Color('#061A24'), horizon: new THREE.Color('#0E2F3D') },
  }), [])

  // Under 200 particles for sea spray (day) / stars (night)
  const particleCount = quality === 'low' ? 0 : 140
  const [particleGeo, particleMat] = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Distribute in upper hemisphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 0.95 + 0.05) // Above horizon
      const radius = 30 + Math.random() * 25

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.cos(phi)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      scales[i] = 0.8 + Math.random() * 1.6
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      color: '#FFFFFF',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    })

    return [geo, mat]
  }, [particleCount])

  useFrame(() => {
    const p = scrollProgressRef?.current || 0
    const mat = skyRef.current?.material
    if (!mat) return

    let top = skyColors.hero.top
    let bottom = skyColors.hero.bottom
    let horizon = skyColors.hero.horizon
    let sunPos = [0, 8, -40]
    let sunColor = '#F7E3AF'
    let sunIntensity = 1.6
    let starsOpacity = 0

    if (p < 0.15) {
      // Hero (0 - 15%)
      top = skyColors.hero.top
      bottom = skyColors.hero.bottom
      horizon = skyColors.hero.horizon
      sunPos = [2, 7.5, -42]
      sunIntensity = 1.4
    } else if (p < 0.40) {
      // About (15 - 40%)
      const t = (p - 0.15) / 0.25
      top = new THREE.Color().lerpColors(skyColors.hero.top, skyColors.about.top, t)
      bottom = new THREE.Color().lerpColors(skyColors.hero.bottom, skyColors.about.bottom, t)
      horizon = new THREE.Color().lerpColors(skyColors.hero.horizon, skyColors.about.horizon, t)
      sunPos = [2 - t * 4, 7.5 + t * 2, -42]
      sunIntensity = 1.4 + t * 0.4
    } else if (p < 0.65) {
      // Rooms (40 - 65%)
      const t = (p - 0.40) / 0.25
      top = new THREE.Color().lerpColors(skyColors.about.top, skyColors.rooms.top, t)
      bottom = new THREE.Color().lerpColors(skyColors.about.bottom, skyColors.rooms.bottom, t)
      horizon = new THREE.Color().lerpColors(skyColors.about.horizon, skyColors.rooms.horizon, t)
      sunPos = [-2 - t * 3, 9.5 - t * 3.5, -42]
      sunIntensity = 1.8 - t * 0.3
    } else if (p < 0.85) {
      // Sunset (65 - 85%)
      const t = (p - 0.65) / 0.20
      top = new THREE.Color().lerpColors(skyColors.rooms.top, skyColors.sunset.top, t)
      bottom = new THREE.Color().lerpColors(skyColors.rooms.bottom, skyColors.sunset.bottom, t)
      horizon = new THREE.Color().lerpColors(skyColors.rooms.horizon, skyColors.sunset.horizon, t)
      sunPos = [-5, 6.0 - t * 5.2, -42] // Sinking sun
      sunColor = t > 0.5 ? '#F4906F' : '#F7B07A'
      sunIntensity = 1.5 - t * 0.8
    } else {
      // Night (85 - 100%)
      const t = (p - 0.85) / 0.15
      top = new THREE.Color().lerpColors(skyColors.sunset.top, skyColors.night.top, t)
      bottom = new THREE.Color().lerpColors(skyColors.sunset.bottom, skyColors.night.bottom, t)
      horizon = new THREE.Color().lerpColors(skyColors.sunset.horizon, skyColors.night.horizon, t)
      sunPos = [-5, 0.8 - t * 8.0, -42] // Below horizon
      sunColor = '#8EB8CC'
      sunIntensity = Math.max(0.2, 0.7 - t * 0.5)
      starsOpacity = t * 0.95 // Stars fade in
    }

    mat.uniforms.uTopColor.value.copy(top)
    mat.uniforms.uBottomColor.value.copy(bottom)
    mat.uniforms.uHorizonColor.value.copy(horizon)

    if (sunMeshRef.current) {
      sunMeshRef.current.position.set(sunPos[0], sunPos[1], sunPos[2])
      sunMeshRef.current.material.color.set(sunColor)
      sunMeshRef.current.visible = sunPos[1] > -2.0
    }

    if (sunLightRef.current) {
      sunLightRef.current.position.set(sunPos[0] * 2, Math.max(1, sunPos[1] * 2), sunPos[2] * 0.5)
      sunLightRef.current.color.set(sunColor)
      sunLightRef.current.intensity = sunIntensity
    }

    if (starsRef.current) {
      starsRef.current.material.opacity = starsOpacity
      starsRef.current.rotation.y += 0.0003
    }
  })

  return (
    <group>
      {/* Sky hemisphere */}
      <mesh ref={skyRef} scale={[-1, 1, 1]}>
        <sphereGeometry args={[75, 24, 16]} />
        <shaderMaterial
          vertexShader={skyVertexShader}
          fragmentShader={skyFragmentShader}
          uniforms={skyUniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Sun / Moon celestial disk */}
      <mesh ref={sunMeshRef} position={[0, 8, -42]}>
        <sphereGeometry args={[2.6, 16, 16]} />
        <meshBasicMaterial color="#F7E3AF" />
      </mesh>

      {/* Main directional sun light */}
      <directionalLight
        ref={sunLightRef}
        position={[0, 16, -20]}
        intensity={1.5}
        color="#F7E3AF"
      />

      {/* Night stars particles */}
      <points
        ref={starsRef}
        geometry={particleGeo}
        material={particleMat}
      />
    </group>
  )
}
