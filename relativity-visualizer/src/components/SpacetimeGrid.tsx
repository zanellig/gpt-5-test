import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GRID_RESOLUTION, GRID_SIZE, GRID_HEIGHT_SCALE, MAX_MASSES, G_SIM } from '../lib/constants'
import type { MassBody } from '../state/store'

const vertexShader = /* glsl */ `
uniform int uMassCount;
uniform vec3 uMassPos[${MAX_MASSES}];
uniform float uMassVal[${MAX_MASSES}];
uniform float uHeightScale;
uniform float uEpsilon;
uniform float uG;

void main() {
  vec3 p = position;
  // Compute world-space position of the current vertex for correct distance calculations
  vec3 worldP = (modelMatrix * vec4(p, 1.0)).xyz;

  float phi = 0.0;
  for (int i = 0; i < ${MAX_MASSES}; i++) {
    if (i >= uMassCount) break;
    vec3 d = uMassPos[i] - worldP;
    float r = length(d) + uEpsilon;
    phi += -uG * uMassVal[i] / r;
  }
  // Displace along local Z, which maps to world Y after the mesh's -PI/2 X-rotation
  p.z += phi * uHeightScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const fragmentShader = /* glsl */ `
void main() {
  gl_FragColor = vec4(0.1, 0.6, 1.0, 0.4);
}
`

export function SpacetimeGrid({ masses }: { masses: MassBody[] }) {
  const uniforms = useMemo(
    () => ({
      uMassCount: { value: 0 },
      uMassPos: { value: Array.from({ length: MAX_MASSES }, () => new THREE.Vector3()) },
      uMassVal: { value: new Array(MAX_MASSES).fill(0) },
      uHeightScale: { value: GRID_HEIGHT_SCALE },
      uEpsilon: { value: 0.25 },
      uG: { value: G_SIM },
    }),
    []
  )

  const geo = useMemo(() => new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_RESOLUTION, GRID_RESOLUTION), [])
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, wireframe: true, transparent: true }),
    [uniforms]
  )
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const count = Math.min(masses.length, MAX_MASSES)
    uniforms.uMassCount.value = count
    for (let i = 0; i < count; i++) {
      const m = masses[i]
      uniforms.uMassPos.value[i].set(m.position[0], m.position[1], m.position[2])
      uniforms.uMassVal.value[i] = m.mass
    }
    for (let i = count; i < MAX_MASSES; i++) {
      uniforms.uMassPos.value[i].set(0, -9999, 0)
      uniforms.uMassVal.value[i] = 0
    }
  })

  return (
    <mesh ref={meshRef} geometry={geo} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} />
  )
}

export default SpacetimeGrid


