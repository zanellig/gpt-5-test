import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GW_BASE_AMP, GW_DAMPING, GW_SPEED } from '../lib/constants'
import type { MassBody } from '../state/store'

// Simple ring wavefronts expanding from a dynamic midpoint between two masses
export function GravitationalWaves({ sources, enabled }: { sources: MassBody[]; enabled: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  const t = useRef(0)

  const geom = useMemo(() => new THREE.RingGeometry(1, 1.02, 256), [])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: GW_BASE_AMP },
          uDamp: { value: GW_DAMPING },
          uSpeed: { value: GW_SPEED },
          uOrigin: { value: new THREE.Vector3(0, 0, 0) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorld = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform float uAmp; uniform float uDamp; uniform float uSpeed; uniform vec3 uOrigin;
          varying vec3 vWorld;
          void main(){
            float r = distance(vWorld, uOrigin);
            float phase = uTime * uSpeed;
            float k = 2.0;
            float wave = 0.5 + 0.5 * sin(k * (r - phase));
            float atten = exp(-uDamp * r);
            float a = uAmp * wave * atten;
            gl_FragColor = vec4(0.4, 0.8, 1.0, clamp(a, 0.0, 0.5));
          }
        `,
      }),
    []
  )

  useFrame((_, delta) => {
    if (!enabled) return
    t.current += delta
    mat.uniforms.uTime.value = t.current
    // Set origin to midpoint of the two most massive bodies (if present)
    if (sources.length >= 2) {
      const sorted = [...sources].sort((a, b) => b.mass - a.mass)
      const a = sorted[0].position
      const b = sorted[1].position
      const mid = new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
      mat.uniforms.uOrigin.value.copy(mid)
      if (ring.current) ring.current.position.copy(mid)
    }
    const radius = Math.max(0.1, t.current * GW_SPEED * 0.5)
    if (ring.current) ring.current.scale.set(radius, 1, radius)
  })

  return enabled ? (
    <mesh ref={ring} geometry={geom} material={mat} rotation={[-Math.PI / 2, 0, 0]} />
  ) : null
}

export default GravitationalWaves


