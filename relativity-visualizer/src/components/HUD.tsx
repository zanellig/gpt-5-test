import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimStore } from '../state/store'
import { gravitationalPotential, timeDilationFactor, computeOrbitalElements, kerrRadiiSim, length } from '../lib/physics'

function formatVec(v: [number, number, number]) {
  return `(${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)})`
}

export function HUDPanel() {
  const selectedMassId = useSimStore((s) => s.selectedMassId)
  const masses = useSimStore((s) => s.masses)
  const clocks = useSimStore((s) => s.clocks)
  const mass = masses.find((m) => m.id === selectedMassId)

  const info = useMemo(() => {
    if (!mass) return null
    const pos = mass.position
    const vel = mass.velocity
    const phi = gravitationalPotential(pos, masses)
    const td = timeDilationFactor(pos, masses)
    const orbit = computeOrbitalElements(pos, vel, masses.filter((m) => m.id !== mass.id))
    let radii: { rPlus?: number; rStaticEquator?: number } = {}
    if (mass.isBlackHole) {
      const spinMag = length(mass.spin ?? [0, 0, 0])
      const r = kerrRadiiSim(mass.mass, spinMag)
      radii = r
    }
    return { pos, vel, phi, td, orbit, radii }
  }, [mass, masses])

  if (!mass || !info) return null

  return (
    <Html position={[mass.position[0], mass.position[1] + 1.8, mass.position[2]]} distanceFactor={20} transform occlude>
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: '8px 10px',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 12,
        minWidth: 260,
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{mass.name}</div>
        <div>Kind: {mass.kind ?? (mass.isBlackHole ? 'blackHole' : 'mass')}</div>
        <div>Mass: {mass.mass.toFixed(3)}</div>
        <div>Velocity: {formatVec(mass.velocity)}</div>
        <div>Spin: {formatVec(mass.spin ?? [0,0,0])}</div>
        <div>Position: {formatVec(mass.position)}</div>
        <div>Potential Φ: {info.phi.toFixed(4)}</div>
        <div>Time dilation (dτ/dt): {info.td.toFixed(6)}</div>
        {info.orbit && info.orbit.isBound ? (
          <div style={{ marginTop: 6 }}>
            <div>Orbit a: {info.orbit.semiMajorAxis?.toFixed(3)}</div>
            <div>e: {info.orbit.eccentricity?.toFixed(4)}</div>
            <div>rp: {info.orbit.periapsis?.toFixed(3)}</div>
            <div>ra: {info.orbit.apoapsis?.toFixed(3)}</div>
          </div>
        ) : null}
        {mass.isBlackHole ? (
          <div style={{ marginTop: 6 }}>
            <div>r+ (horizon): {info.radii.rPlus?.toFixed(3)}</div>
            <div>r_static,eq (ergosphere eq.): {info.radii.rStaticEquator?.toFixed(3)}</div>
          </div>
        ) : null}
      </div>
    </Html>
  )
}

export default HUDPanel


