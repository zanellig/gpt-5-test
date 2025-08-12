import { useRef } from 'react'
import { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import type { Photon as PhotonType } from '../state/store'

export function Photon({ photon }: { photon: PhotonType }) {
  const ref = useRef<THREE.Mesh>(null)
  return (
    <mesh ref={ref} position={photon.position as ThreeElements['mesh']['position']}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial color={photon.color ?? '#66ccff'} emissive={photon.color ?? '#66ccff'} emissiveIntensity={0.8} />
    </mesh>
  )
}

export default Photon


