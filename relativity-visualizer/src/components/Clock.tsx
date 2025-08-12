import { useRef } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { GravClock } from '../state/store'

export function Clock({ clock }: { clock: GravClock }) {
  const ref = useRef<THREE.Mesh>(null)
  return (
    <group position={clock.position as unknown as [number, number, number]}>
      <mesh ref={ref}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={clock.color ?? '#ffffff'} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.25} color={clock.color ?? 'white'}>
        {clock.properTime.toFixed(1)}s
      </Text>
    </group>
  )
}

export default Clock


