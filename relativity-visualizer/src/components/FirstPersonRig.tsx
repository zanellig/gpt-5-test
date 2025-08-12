import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useSimStore } from '../state/store'
import { timeDilationFactor } from '../lib/physics'

export function FirstPersonRig() {
  const { camera } = useThree()
  const observer = useSimStore((s) => s.observer)
  const masses = useSimStore((s) => s.masses)
  const clocks = useSimStore((s) => s.clocks)
  const config = useSimStore((s) => s.config)

  const textRef = useRef<THREE.Object3D>(null)
  const localClock = useRef(0)
  const worldClock = useRef(0)

  const getObserverPosition = useMemo(() => {
    return () => {
      if (!observer) return new THREE.Vector3(0, 1.6, 5)
      if (observer.kind === 'mass') {
        const m = useSimStore.getState().masses.find((x) => x.id === observer.id)
        if (m) return new THREE.Vector3(...m.position)
      } else if (observer.kind === 'testBody') {
        const b = useSimStore.getState().testBodies.find((x) => x.id === observer.id)
        if (b) return new THREE.Vector3(...b.position)
      } else if (observer.kind === 'photon') {
        const p = useSimStore.getState().photons.find((x) => x.id === observer.id)
        if (p) return new THREE.Vector3(...p.position)
      }
      return new THREE.Vector3(0, 1.6, 5)
    }
  }, [observer])

  useEffect(() => {
    // Slight tilt downward
    camera.rotation.set(-0.1, 0, 0)
  }, [camera])

  useFrame((_, delta) => {
    const pos = getObserverPosition()
    camera.position.lerp(pos.clone().add(new THREE.Vector3(0, 1.5, 0)), 0.2)
    // Update clocks
    const tf = timeDilationFactor([camera.position.x, camera.position.y, camera.position.z], masses)
    localClock.current += delta * tf
    worldClock.current += delta
    // Update text
    if (textRef.current) {
      const ui = textRef.current as any
      ui.text = `${localClock.current.toFixed(2)}s\nΔt/ΔT=${tf.toFixed(3)}`
    }
  })

  return (
    <group>
      {/* Local clock HUD */}
      <Text ref={textRef as any} position={[0, 2, -2]} fontSize={0.2} color="#ffffff">
        0.00s
      </Text>
    </group>
  )
}

export default FirstPersonRig


