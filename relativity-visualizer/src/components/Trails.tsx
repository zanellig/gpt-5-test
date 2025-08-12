import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vector3Tuple } from '../state/store'

export function Trail({ color = '#ffffff', length = 256, source }: { color?: string; length?: number; source: () => Vector3Tuple }) {
  const geom = useMemo(() => new THREE.BufferGeometry(), [])
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, linewidth: 1 }), [color])
  const positions = useRef(new Float32Array(length * 3))
  const head = useRef(0)
  const lineRef = useRef<THREE.Line>(null)

  useEffect(() => {
    geom.setAttribute('position', new THREE.BufferAttribute(positions.current, 3))
  }, [geom])

  useFrame(() => {
    const p = source()
    positions.current[head.current * 3 + 0] = p[0]
    positions.current[head.current * 3 + 1] = p[1]
    positions.current[head.current * 3 + 2] = p[2]
    head.current = (head.current + 1) % length
    const attr = geom.getAttribute('position') as THREE.BufferAttribute
    attr.needsUpdate = true
  })

  return <line ref={lineRef} geometry={geom} material={mat} />
}

export default Trail


