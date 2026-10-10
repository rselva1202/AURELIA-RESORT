import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const oceanVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uWaveHeight;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying float vWaveElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wave harmonics
    float wave1 = sin(pos.x * 0.12 + uTime * uSpeed * 1.2) * cos(pos.y * 0.09 + uTime * uSpeed * 0.9);
    float wave2 = sin(pos.x * 0.28 - uTime * uSpeed * 1.5) * sin(pos.y * 0.22 + uTime * uSpeed * 1.1) * 0.45;
    float wave3 = cos((pos.x + pos.y) * 0.35 + uTime * uSpeed * 2.0) * 0.25;
    
    float elevation = (wave1 + wave2 + wave3) * uWaveHeight;
    pos.z += elevation;
    vWaveElevation = elevation;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const oceanFragmentShader = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform vec3 uColorFoam;
  uniform vec3 uSunPosition;
  uniform vec3 uSunColor;
  uniform float uScrollProgress;
  uniform float uEnableFoam;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying float vWaveElevation;

  void main() {
    // Normal estimation from derivatives
    vec3 dX = dFdx(vWorldPosition);
    vec3 dY = dFdy(vWorldPosition);
    vec3 normal = normalize(cross(dX, dY));

    // Base color gradient based on elevation
    float depthMix = smoothstep(-1.2, 1.2, vWaveElevation);
    vec3 waterColor = mix(uColorDeep, uColorShallow, depthMix);

    // Sun specular reflection
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(uSunPosition - vWorldPosition);
    vec3 reflectDir = reflect(-sunDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = uSunColor * spec * 0.75;

    // Foam lines near wave crests and shore
    float foam = 0.0;
    if (uEnableFoam > 0.5) {
      foam = smoothstep(0.7, 1.1, vWaveElevation);
      // Soft foam near the cliff region (x > 2.0)
      if (vWorldPosition.x > 2.0) {
        float shoreFoam = sin(vWorldPosition.y * 1.5 + vWaveElevation * 4.0) * 0.5 + 0.5;
        foam += shoreFoam * smoothstep(2.0, 5.0, vWorldPosition.x) * 0.4;
      }
    }
    vec3 finalColor = mix(waterColor + specular, uColorFoam, clamp(foam, 0.0, 1.0));

    // Soft distance fog blend
    float dist = length(vWorldPosition - cameraPosition);
    float fogFactor = smoothstep(25.0, 80.0, dist);
    
    gl_FragColor = vec4(finalColor, 1.0 - fogFactor * 0.35);
  }
`

export default function OceanMesh({ quality = 'high', scrollProgressRef }) {
  const meshRef = useRef()
  const segments = quality === 'low' ? 20 : 64

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 1.0 },
    uWaveHeight: { value: quality === 'low' ? 0.35 : 0.55 },
    uColorDeep: { value: new THREE.Color('#082F3B') },
    uColorShallow: { value: new THREE.Color('#1B6774') },
    uColorFoam: { value: new THREE.Color('#94DDD5') },
    uSunPosition: { value: new THREE.Vector3(0, 8, -35) },
    uSunColor: { value: new THREE.Color('#F7E3AF') },
    uScrollProgress: { value: 0 },
    uEnableFoam: { value: quality === 'low' ? 0.0 : 1.0 },
  }), [quality])

  // Color targets for different phases
  const deepDay = useMemo(() => new THREE.Color('#082F3B'), [])
  const shallowDay = useMemo(() => new THREE.Color('#1B6774'), [])
  const deepSunset = useMemo(() => new THREE.Color('#2A1428'), [])
  const shallowSunset = useMemo(() => new THREE.Color('#823330'), [])
  const deepNight = useMemo(() => new THREE.Color('#030F17'), [])
  const shallowNight = useMemo(() => new THREE.Color('#092230'), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material
    mat.uniforms.uTime.value += delta

    const p = scrollProgressRef?.current || 0
    mat.uniforms.uScrollProgress.value = p

    // Interpolate water colors based on scroll progress
    if (p < 0.65) {
      // Daytime to late afternoon
      mat.uniforms.uColorDeep.value.copy(deepDay)
      mat.uniforms.uColorShallow.value.copy(shallowDay)
      mat.uniforms.uSunColor.value.set('#F7E3AF')
    } else if (p < 0.85) {
      // Sunset transition
      const t = (p - 0.65) / 0.20
      mat.uniforms.uColorDeep.value.lerpColors(deepDay, deepSunset, t)
      mat.uniforms.uColorShallow.value.lerpColors(shallowDay, shallowSunset, t)
      mat.uniforms.uSunColor.value.lerpColors(new THREE.Color('#F7E3AF'), new THREE.Color('#F4906F'), t)
    } else {
      // Night transition
      const t = (p - 0.85) / 0.15
      mat.uniforms.uColorDeep.value.lerpColors(deepSunset, deepNight, t)
      mat.uniforms.uColorShallow.value.lerpColors(shallowSunset, shallowNight, t)
      mat.uniforms.uSunColor.value.lerpColors(new THREE.Color('#F4906F'), new THREE.Color('#6F8E9C'), t)
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.4, -10]}
    >
      <planeGeometry args={[90, 90, segments, segments]} />
      <shaderMaterial
        vertexShader={oceanVertexShader}
        fragmentShader={oceanFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}
