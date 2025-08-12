import { useMemo } from 'react'
import * as THREE from 'three'
import type { MassBody } from '../state/store'

function kerrRadii(mass: number, spinMag: number) {
  // Geometric units, stylized scaling to scene units
  const m = Math.max(0.0001, mass)
  const a = Math.min(0.99, Math.max(0, spinMag)) * m
  const rPlus = m + Math.sqrt(Math.max(0, m * m - a * a))
  const rStaticEquator = m + Math.sqrt(Math.max(0, m * m - 0))
  const scale = 0.05 // visual scale factor
  return { rHorizon: rPlus * scale, rStaticEquator: rStaticEquator * scale }
}

export function BlackHole({ body }: { body: MassBody }) {
  const spin = body.spin ?? [0, 0, 0]
  const spinVec = new THREE.Vector3(spin[0], spin[1], spin[2])
  const radii = useMemo(() => kerrRadii(body.mass, spinVec.length()), [body.mass, spinVec])
  const axis = useMemo(() => {
    const v = spinVec.clone().normalize()
    if (v.length() < 0.001) return new THREE.Vector3(0, 1, 0)
    return v
  }, [spinVec])

  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis), [axis])

  return (
    <group position={body.position as unknown as [number, number, number]} quaternion={q}>
      {/* Event horizon */}
      <mesh>
        <sphereGeometry args={[radii.rHorizon, 64, 64]} />
        <meshStandardMaterial color="#000000" emissive="#000000" roughness={1} metalness={0} />
      </mesh>
      {/* Ergosphere (approx: equatorial static limit as sphere) */}
      <mesh>
        <sphereGeometry args={[radii.rStaticEquator, 64, 64]} />
        <meshStandardMaterial color="#3366ff" transparent opacity={0.15} emissive="#2244aa" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}

export default BlackHole


