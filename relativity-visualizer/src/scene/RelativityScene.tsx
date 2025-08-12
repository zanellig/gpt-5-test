import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stats, Environment } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useSimStore } from '../state/store'
import { SpacetimeGrid } from '../components/SpacetimeGrid'
import { Mass } from '../components/Mass'
import { Photon } from '../components/Photon'
import { Clock } from '../components/Clock'
import { TestBody } from '../components/TestBody'
import { BlackHole } from '../components/BlackHole'
import { GravitationalWaves } from '../components/GravitationalWaves'
import { FirstPersonRig } from '../components/FirstPersonRig'
import { DEFAULT_DT } from '../lib/constants'
import { stepClock, stepPhoton, stepTestBody, stepMass } from '../lib/physics'

function SimulationStepper() {
  const config = useSimStore((s) => s.config)
  const masses = useSimStore((s) => s.masses)
  const photons = useSimStore((s) => s.photons)
  const clocks = useSimStore((s) => s.clocks)
  const testBodies = useSimStore((s) => s.testBodies)
  const updateMass = useSimStore((s) => s.updateMass)
  const updatePhoton = useSimStore((s) => s.updatePhoton)
  const updateClock = useSimStore((s) => s.updateClock)
  const updateTestBody = useSimStore((s) => s.updateTestBody)
  const paused = useSimStore((s) => s.config.paused)

  const accumulator = useRef(0)

  useFrame((_, delta) => {
    if (paused) return
    accumulator.current += delta
    const step = config.dt ?? DEFAULT_DT
    while (accumulator.current >= step) {
      for (const p of photons) {
        const next = stepPhoton(p, masses, step, config)
        updatePhoton(p.id, next)
      }
      for (const c of clocks) {
        const next = stepClock(c, masses, step)
        updateClock(c.id, next)
      }
      for (const m of masses) {
        const next = stepMass(m, masses, step)
        updateMass(m.id, next)
      }
      for (const b of testBodies) {
        const next = stepTestBody(b, masses, step, config)
        updateTestBody(b.id, next)
      }
      accumulator.current -= step
    }
  })
  return null
}

function InteractionPlane() {
  const addMass = useSimStore((s) => s.addMass)
  const addClock = useSimStore((s) => s.addClock)
  const addPhoton = useSimStore((s) => s.addPhoton)
  const uiMode = useSimStore((s) => s.uiMode)
  const setSelectedMassId = useSimStore((s) => s.setSelectedMassId)
  const planeRef = useRef<THREE.Mesh>(null)

  const handleClick = (e: any) => {
    e.stopPropagation()
    const p = e.point as THREE.Vector3
    const pos: [number, number, number] = [p.x, 0, p.z]
    if (uiMode === 'addMass') addMass({ position: pos })
    else if (uiMode === 'addClock') addClock({ position: pos })
    else if (uiMode === 'addPhoton') addPhoton({ position: pos })
    else setSelectedMassId(undefined)
  }

  return (
    <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[80, 80]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

export function RelativityScene() {
  const masses = useSimStore((s) => s.masses)
  const photons = useSimStore((s) => s.photons)
  const clocks = useSimStore((s) => s.clocks)
  const testBodies = useSimStore((s) => s.testBodies)
  const config = useSimStore((s) => s.config)
  const setSelectedMassId = useSimStore((s) => s.setSelectedMassId)

  const ambient = useMemo(() => new THREE.AmbientLight(0xffffff, 0.4), [])
  const dir = useMemo(() => new THREE.DirectionalLight(0xffffff, 1.0), [])

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
      <primitive object={ambient} />
      <primitive object={dir} position={[5, 10, 5]} />
      <color attach="background" args={["#000000"]} />
      <Environment preset="night" background />
      <gridHelper args={[40, 40, 'white', '#444']} />

      <SpacetimeGrid masses={masses} />
      {masses.map((m) => (
        <group key={m.id} onClick={(e) => { e.stopPropagation(); setSelectedMassId(m.id) }}>
          <Mass body={m} />
          {config.showBlackHoleVisuals && m.isBlackHole ? <BlackHole body={m} /> : null}
        </group>
      ))}
      {photons.map((p) => (
        <Photon key={p.id} photon={p} />
      ))}
      {clocks.map((c) => (
        <Clock key={c.id} clock={c} />
      ))}
      {testBodies.map((b) => (
        <TestBody key={b.id} body={b} />
      ))}

      <InteractionPlane />
      {config.viewMode === 'god' ? <OrbitControls makeDefault /> : null}
      <Stats />
      <SimulationStepper />
      {config.showGravitationalWaves ? (
        <GravitationalWaves sources={masses} enabled={config.showGravitationalWaves} />
      ) : null}
      {config.viewMode === 'firstPerson' ? <FirstPersonRig /> : null}
    </Canvas>
  )
}

export default RelativityScene


