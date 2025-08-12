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
import { Trail } from '../components/Trails'
import { EffectsLayer } from '../components/Effects'
import { HUDPanel } from '../components/HUD'
import { DEFAULT_DT } from '../lib/constants'
import { stepClock, stepPhoton, stepTestBody, stepMass } from '../lib/physics'
import { bodyRadiusApprox, distance } from '../lib/physics'
import { TTL_WAVEBURST, TTL_KILONOVA, TTL_ACCRETION, TTL_EXPLOSION, TTL_DEBRIS, TOV_LIMIT_SIM } from '../lib/constants'

function SimulationStepper() {
  const config = useSimStore((s) => s.config)
  const addEffect = useSimStore((s) => s.addEffect)
  const removeMass = useSimStore((s) => s.removeMass)
  const addMass = useSimStore((s) => s.addMass)
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
      // After integration step, check collisions among masses
      for (let i = 0; i < masses.length; i++) {
        for (let j = i + 1; j < masses.length; j++) {
          const a = masses[i]
          const b = masses[j]
          const ra = bodyRadiusApprox(a)
          const rb = bodyRadiusApprox(b)
          const d = distance(a.position, b.position)
          if (d <= ra + rb) {
            // Handle interaction based on kinds
            const kindA = a.kind ?? (a.isBlackHole ? 'blackHole' : 'star')
            const kindB = b.kind ?? (b.isBlackHole ? 'blackHole' : 'star')
            const pos: [number, number, number] = [
              (a.position[0] + b.position[0]) / 2,
              (a.position[1] + b.position[1]) / 2,
              (a.position[2] + b.position[2]) / 2,
            ]

            const totalMass = a.mass + b.mass
            const momentum: [number, number, number] = [
              a.velocity[0] * a.mass + b.velocity[0] * b.mass,
              a.velocity[1] * a.mass + b.velocity[1] * b.mass,
              a.velocity[2] * a.mass + b.velocity[2] * b.mass,
            ]
            const vMerged: [number, number, number] = [
              momentum[0] / totalMass,
              momentum[1] / totalMass,
              momentum[2] / totalMass,
            ]


            // BH-BH -> BH + GW burst (remove originals and create merged BH)
            if (kindA === 'blackHole' && kindB === 'blackHole') {
              removeMass(a.id)
              removeMass(b.id)
              addMass({ name: 'BH Merger', mass: totalMass, position: pos, velocity: vMerged, color: '#ff9966', isBlackHole: true, spin: [0, (a.spin?.[1] ?? 0) + (b.spin?.[1] ?? 0), 0], kind: 'blackHole' })
              addEffect({ type: 'waveBurst', origin: pos, amplitude: 1, ttl: TTL_WAVEBURST })
              continue
            }

            // NS-NS -> kilonova, outcome BH if above TOV (remove originals and create remnant)
            if (kindA === 'neutronStar' && kindB === 'neutronStar') {
              removeMass(a.id)
              removeMass(b.id)
              addEffect({ type: 'kilonova', origin: pos, ttl: TTL_KILONOVA })
              if (totalMass >= TOV_LIMIT_SIM) {
                addMass({ name: 'BH (post-kilonova)', mass: totalMass, position: pos, velocity: vMerged, color: '#ff8844', isBlackHole: true, kind: 'blackHole' })
              } else {
                addMass({ name: 'Massive NS', mass: totalMass, position: pos, velocity: vMerged, color: '#ddeeff', kind: 'neutronStar' })
              }
              continue
            }

            // BH - Star/Planet -> tidal disruption + accretion disk (keep BH, remove the other; accrete mass)
            if ((kindA === 'blackHole' && (kindB === 'star' || kindB === 'planet')) || (kindB === 'blackHole' && (kindA === 'star' || kindA === 'planet'))) {
              const bh = kindA === 'blackHole' ? a : b
              const other = kindA === 'blackHole' ? b : a
              removeMass(other.id)
              const accreted = other.mass * 0.8
              const newMass = bh.mass + accreted
              const spinY = (bh.spin?.[1] ?? 0) + (other.spin?.[1] ?? 0) * 0.1
              updateMass(bh.id, { mass: newMass, velocity: vMerged, position: bh.position, spin: [bh.spin?.[0] ?? 0, spinY, bh.spin?.[2] ?? 0] })
              addEffect({ type: 'accretionDisk', massId: bh.id, radius: Math.max(1, bodyRadiusApprox(other) * 3), ttl: TTL_ACCRETION })
              continue
            }

            // Star-Star -> hotter larger star + explosion ejecta
            if ((kindA === 'star' && kindB === 'star')) {
              removeMass(a.id)
              removeMass(b.id)
              addMass({ name: 'Merged Star', mass: totalMass, position: pos, velocity: vMerged, color: '#ffd080', kind: 'star' })
              addEffect({ type: 'explosion', origin: pos, ttl: TTL_EXPLOSION })
              continue
            }

            // Planetary collisions -> merged body + debris ring
            if ((kindA === 'planet' && kindB === 'planet') || ((kindA === 'planet' && kindB === 'star') || (kindB === 'planet' && kindA === 'star'))) {
              const kind = (kindA === 'planet' && kindB === 'planet') ? 'planet' : 'star'
              removeMass(a.id)
              removeMass(b.id)
              const id = addMass({ name: kind === 'planet' ? 'Merged Planet' : 'Star Impact', mass: totalMass, position: pos, velocity: vMerged, color: kind === 'planet' ? '#88aaff' : '#ffbb66', kind })
              addEffect({ type: 'debrisRing', massId: id, inner: 0.8, outer: 1.6, ttl: TTL_DEBRIS })
              continue
            }
          }
        }
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
        <group key={b.id}>
          <TestBody body={b} />
          {config.precessionDemoEnabled ? (
            <Trail color="#66ffaa" length={512} source={() => b.position} />
          ) : null}
        </group>
      ))}

      <InteractionPlane />
      {config.viewMode === 'god' ? <OrbitControls makeDefault /> : null}
      <Stats />
      <SimulationStepper />
      {config.showGravitationalWaves ? (
        <GravitationalWaves sources={masses} enabled={config.showGravitationalWaves} />
      ) : null}
      {config.viewMode === 'firstPerson' ? <FirstPersonRig /> : null}
      <EffectsLayer />
      <HUDPanel />
    </Canvas>
  )
}

export default RelativityScene


