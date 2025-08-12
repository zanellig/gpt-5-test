import { useRef } from 'react'
import { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import type { MassBody } from '../state/store'

export function Mass({ body }: { body: MassBody }) {
  const ref = useRef<THREE.Mesh>(null)
  const radius = Math.cbrt(body.mass) * 0.5
  return (
    <mesh ref={ref} position={body.position as ThreeElements['mesh']['position']}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={body.color ?? '#ffaa00'} emissive={body.color ?? '#ffaa00'} emissiveIntensity={0.2} />
    </mesh>
  )
}

export default Mass


