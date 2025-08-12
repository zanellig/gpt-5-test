import { useRef } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import type { TestBody as TestBodyType } from '../state/store'

export function TestBody({ body }: { body: TestBodyType }) {
  const ref = useRef<THREE.Mesh>(null)
  const radius = Math.cbrt(body.mass) * 0.25
  return (
    <mesh ref={ref} position={body.position as ThreeElements['mesh']['position']}>
      <sphereGeometry args={[radius, 20, 20]} />
      <meshStandardMaterial color={body.color ?? '#aaff66'} />
    </mesh>
  )
}

export default TestBody


