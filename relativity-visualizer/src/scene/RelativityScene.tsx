import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, StatsGl, Sky, Grid, Environment } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useSimStore } from '../state/store'
import { SpacetimeGrid } from '../components/SpacetimeGrid'
import { Mass } from '../components/Mass'
import { Photon } from '../components/Photon'
import { Clock } from '../components/Clock'
import { DEFAULT_DT } from '../lib/constants'
import { stepClock, stepPhoton } from '../lib/physics'

function SimulationStepper() {
  const { config, masses, photons, clocks, updatePhoton, updateClock, paused } = useSimStore((s) => ({
    config: s.config,
    masses: s.masses,
    photons: s.photons,
    clocks: s.clocks,
    updatePhoton: s.updatePhoton,
    updateClock: s.updateClock,
    paused: s.config.paused,
  }))

  const accumulator = useRef(0)

  useFrame((_, delta) => {
    if (paused) return
    accumulator.current += delta
    const step = config.dt ?? DEFAULT_DT
    while (accumulator.current >= step) {
      for (const p of photons) {
        const next = stepPhoton(p, masses, step)
        updatePhoton(p.id, next)
      }
      for (const c of clocks) {
        const next = stepClock(c, masses, step)
        updateClock(c.id, next)
      }
      accumulator.current -= step
    }
  })
  return null
}

export function RelativityScene() {
  const { masses, photons, clocks } = useSimStore((s) => ({
    masses: s.masses,
    photons: s.photons,
    clocks: s.clocks,
  }))

  const ambient = useMemo(() => new THREE.AmbientLight(0xffffff, 0.4), [])
  const dir = useMemo(() => new THREE.DirectionalLight(0xffffff, 1.0), [])

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
      <primitive object={ambient} />
      <primitive object={dir} position={[5, 10, 5]} />
      <Sky sunPosition={[50, 50, 50]} />
      <Environment preset="night" />
      <gridHelper args={[40, 40, 'white', '#444']} />

      <SpacetimeGrid masses={masses} />
      {masses.map((m) => (
        <Mass key={m.id} body={m} />
      ))}
      {photons.map((p) => (
        <Photon key={p.id} photon={p} />
      ))}
      {clocks.map((c) => (
        <Clock key={c.id} clock={c} />
      ))}

      <OrbitControls makeDefault />
      <StatsGl />
      <SimulationStepper />
    </Canvas>
  )
}

export default RelativityScene


