import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useSimStore } from '../state/store'

function WaveBurst({ origin, ttl, id }: { origin: [number, number, number]; ttl: number; id: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (mesh.current) {
      const r = Math.max(0.1, t.current * 5)
      mesh.current.scale.set(r, 1, r)
      const alpha = Math.max(0, 1 - t.current / ttl) * 0.5
      ;(mesh.current.material as THREE.MeshBasicMaterial).opacity = alpha
    }
    if (t.current > ttl) useSimStore.getState().removeEffect(id)
  })
  return (
    <mesh ref={mesh} position={origin as any} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1, 1.02, 256]} />
      <meshBasicMaterial color="#66ccff" transparent opacity={0.5} />
    </mesh>
  )
}

function Explosion({ origin, color = '#ffaa55', ttl, id }: { origin: [number, number, number]; color?: string; ttl: number; id: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (mesh.current) {
      const s = 1 + t.current * 6
      mesh.current.scale.setScalar(s)
      const alpha = Math.max(0, 1 - t.current / ttl)
      ;(mesh.current.material as THREE.MeshBasicMaterial).opacity = alpha
    }
    if (t.current > ttl) useSimStore.getState().removeEffect(id)
  })
  return (
    <mesh ref={mesh} position={origin as any}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
    </mesh>
  )
}

function DebrisRing({ massId, inner, outer, ttl, id }: { massId: string; inner: number; outer: number; ttl: number; id: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (mesh.current) {
      mesh.current.rotation.z += delta * 0.2
      const alpha = Math.max(0, 1 - t.current / ttl)
      ;(mesh.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * alpha
      const m = useSimStore.getState().masses.find((x) => x.id === massId)
      if (m) mesh.current.position.set(m.position[0], m.position[1] + 0.01, m.position[2])
    }
    if (t.current > ttl) useSimStore.getState().removeEffect(id)
  })
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 128]} />
      <meshBasicMaterial color="#cccccc" transparent opacity={0.6} />
    </mesh>
  )
}

function AccretionDisk({ massId, radius, ttl, id }: { massId: string; radius: number; ttl: number; id: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (mesh.current) {
      mesh.current.rotation.z += delta
      const alpha = Math.max(0, 1 - t.current / ttl)
      ;(mesh.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * alpha
      const m = useSimStore.getState().masses.find((x) => x.id === massId)
      if (m) mesh.current.position.set(m.position[0], m.position[1], m.position[2])
    }
    if (t.current > ttl) useSimStore.getState().removeEffect(id)
  })
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.6, radius, 256]} />
      <meshBasicMaterial color="#ffddaa" transparent opacity={0.7} />
    </mesh>
  )
}

function Kilonova({ origin, ttl, id }: { origin: [number, number, number]; ttl: number; id: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (mesh.current) {
      const s = 0.5 + t.current * 8
      mesh.current.scale.setScalar(s)
      const alpha = Math.max(0, 1 - t.current / ttl)
      ;(mesh.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * alpha
    }
    if (t.current > ttl) useSimStore.getState().removeEffect(id)
  })
  return (
    <mesh ref={mesh} position={origin as any}>
      <sphereGeometry args={[0.5, 48, 48]} />
      <meshBasicMaterial color="#ffee88" transparent opacity={0.8} />
    </mesh>
  )
}

export function EffectsLayer() {
  const effects = useSimStore((s) => s.effects)
  return (
    <group>
      {effects.map((e) => {
        switch (e.type) {
          case 'waveBurst':
            return <WaveBurst key={e.id} id={e.id} origin={e.origin} ttl={e.ttl} />
          case 'kilonova':
            return <Kilonova key={e.id} id={e.id} origin={e.origin} ttl={e.ttl} />
          case 'accretionDisk':
            return <AccretionDisk key={e.id} id={e.id} massId={e.massId} radius={e.radius} ttl={e.ttl} />
          case 'explosion':
            return <Explosion key={e.id} id={e.id} origin={e.origin} ttl={e.ttl} />
          case 'debrisRing':
            return <DebrisRing key={e.id} id={e.id} massId={e.massId} inner={e.inner} outer={e.outer} ttl={e.ttl} />
          default:
            return null
        }
      })}
    </group>
  )
}

export default EffectsLayer


