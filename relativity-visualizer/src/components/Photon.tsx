import { useRef } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import type { Photon as PhotonType } from '../state/store'

export function Photon({ photon }: { photon: PhotonType }) {
  const ref = useRef<THREE.Mesh>(null)
  // Map frequency proxy to color hue shift
  const hue = Math.max(0, Math.min(0.75, 0.6 + -0.2 * ((photon.frequency ?? 1) - 1)))
  const color = new THREE.Color().setHSL(hue, 0.7, 0.6)
  return (
    <mesh ref={ref} position={photon.position as ThreeElements['mesh']['position']}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial color={photon.color ?? color} emissive={photon.color ?? color} emissiveIntensity={0.9} />
    </mesh>
  )
}

export default Photon


