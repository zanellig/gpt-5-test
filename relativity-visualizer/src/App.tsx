import { useEffect } from 'react'
import { Leva, useControls, button } from 'leva'
import { RelativityScene } from './scene/RelativityScene'
import { useSimStore } from './state/store'
import './App.css'

// Working implementation

function App() {
  const addMass = useSimStore((s) => s.addMass)
  const addPhoton = useSimStore((s) => s.addPhoton)
  const addClock = useSimStore((s) => s.addClock)
  const addTestBody = useSimStore((s) => s.addTestBody)
  const updateTestBody = useSimStore((s) => s.updateTestBody)
  const updatePhoton = useSimStore((s) => s.updatePhoton)
  const updateClock = useSimStore((s) => s.updateClock)
  const setPaused = useSimStore((s) => s.setPaused)
  const setDt = useSimStore((s) => s.setDt)
  const setConfig = useSimStore((s) => s.setConfig)
  const setViewMode = useSimStore((s) => s.setViewMode)
  const reset = useSimStore((s) => s.reset)
  const uiMode = useSimStore((s) => s.uiMode)
  const setUiMode = useSimStore((s) => s.setUiMode)
  const masses = useSimStore((s) => s.masses)
  const selectedMassId = useSimStore((s) => s.selectedMassId)
  const selectedPhotonId = useSimStore((s) => s.selectedPhotonId)
  const selectedClockId = useSimStore((s) => s.selectedClockId)
  const selectedTestBodyId = useSimStore((s) => s.selectedTestBodyId)
  const updateMass = useSimStore((s) => s.updateMass)
  const config = useSimStore((s) => s.config)

  useEffect(() => {
    // Seed initial scene
    if (useSimStore.getState().masses.length === 0) {
      addMass({ name: 'Black Hole', mass: 20, position: [0, 0, 0], color: '#ff8800', isBlackHole: true, kind: 'blackHole', spin: [0, 0.6, 0] })
      addClock({ position: [5, 0, 0], color: '#00ff88' })
      addClock({ position: [10, 0, 0], color: '#ffffff' })
    }
  }, [])

  useControls('Simulation', {
    Pause: button(() => setPaused(true)),
    Play: button(() => setPaused(false)),
    'Reset Scene': button(() => {
      reset()
      addMass({ name: 'Black Hole', mass: 20, position: [0, 0, 0], color: '#ff8800', isBlackHole: true, kind: 'blackHole', spin: [0, 0.6, 0] })
      addClock({ position: [5, 0, 0], color: '#00ff88' })
      addClock({ position: [10, 0, 0], color: '#ffffff' })
    }),
    'Time Step (dt)': {
      value: 0.016,
      min: 0.001,
      max: 0.05,
      step: 0.001,
      onChange: (v: number) => setDt(v),
    },
    'Add Photon (left)': button(() => addPhoton({ position: [-15, 0, 0], velocity: [10, 0, 0] })),
    'Add Photon (right)': button(() => addPhoton({ position: [15, 0, 0], velocity: [-10, 0, 0] })),
    'Add Clock (random ring)': button(() => {
      const r = 5 + Math.random() * 10
      const a = Math.random() * Math.PI * 2
      addClock({ position: [Math.cos(a) * r, 0, Math.sin(a) * r] })
    }),
    'Add Mass (planet)': button(() => {
      const r = 4 + Math.random() * 8
      const a = Math.random() * Math.PI * 2
      addMass({ name: 'Planet', mass: 4 + Math.random() * 6, position: [Math.cos(a) * r, 0, Math.sin(a) * r], color: '#44bbff' })
    }),
    'Add Test Body': button(() => addTestBody()),
    'Spawn Inspiral (GW)': button(() => {
      reset()
      addMass({ name: 'BH A', mass: 15, position: [-5, 0, 0], velocity: [0, 0, 1.2], color: '#ff8844', isBlackHole: true, kind: 'blackHole', spin: [0, 0.6, 0] })
      addMass({ name: 'BH B', mass: 12, position: [5, 0, 0], velocity: [0, 0, -1.2], color: '#ffcc55', isBlackHole: true, kind: 'blackHole', spin: [0, -0.4, 0] })
      addClock({ position: [0, 0, 0], color: '#ffffff' })
      setConfig({ showGravitationalWaves: true })
    }),
    'Precession Orbit (GR)': button(() => {
      reset()
      addMass({ name: 'Star', mass: 20, position: [0, 0, 0], color: '#ffaa00' })
      const tb = addTestBody({ position: [10, 0, 0], velocity: [0, 0, 2.2], mass: 0.01, color: '#66ffaa', })
      // mark GR mode on the test body
      updateTestBody(tb, { useGR: true })
      setConfig({ precessionDemoEnabled: true })
    }),
  })

  useControls('Modes', {
    Mode: {
      value: uiMode,
      options: {
        Select: 'select',
        'Add Mass': 'addMass',
        'Add Clock': 'addClock',
        'Add Photon': 'addPhoton',
        'Add Test Body': 'addTestBody',
      },
      onChange: (v: any) => setUiMode(v),
    },
    View: {
      value: config.viewMode,
      options: { 'God View': 'god', 'First Person': 'firstPerson' },
      onChange: (v: any) => setViewMode(v),
    },
    'Black Hole Visuals': {
      value: config.showBlackHoleVisuals,
      onChange: (v: boolean) => setConfig({ showBlackHoleVisuals: v }),
    },
    'Gravitational Waves': {
      value: config.showGravitationalWaves,
      onChange: (v: boolean) => setConfig({ showGravitationalWaves: v }),
    },
    'Precession Demo': {
      value: config.precessionDemoEnabled,
      onChange: (v: boolean) => setConfig({ precessionDemoEnabled: v }),
    },
    'GR Precession Factor': {
      value: config.grPrecessionFactor,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v: number) => setConfig({ grPrecessionFactor: v }),
    },
  })

  const selected = masses.find((m) => m.id === selectedMassId)
  const selPhoton = useSimStore((s) => s.photons.find((p) => p.id === selectedPhotonId))
  const selClock = useSimStore((s) => s.clocks.find((c) => c.id === selectedClockId))
  const selBody = useSimStore((s) => s.testBodies.find((b) => b.id === selectedTestBodyId))
  useControls(selected ? `Selected: ${selected.name}` : 'Selected', selected ? {
    name: { value: selected.name },
    mass: {
      value: selected.mass,
      min: 0.5,
      max: 50,
      step: 0.5,
      onChange: (v: number) => updateMass(selected.id, { mass: v }),
    },
    isBlackHole: {
      value: selected.isBlackHole ?? false,
      onChange: (v: boolean) => updateMass(selected.id, { isBlackHole: v }),
    },
    spinY: {
      value: (selected.spin ?? [0, 0, 0])[1],
      min: -0.99,
      max: 0.99,
      step: 0.01,
      onChange: (v: number) => updateMass(selected.id, { spin: [selected.spin?.[0] ?? 0, v, selected.spin?.[2] ?? 0] }),
    },
    vx: {
      value: selected.velocity[0],
      min: -10,
      max: 10,
      step: 0.1,
      onChange: (v: number) => updateMass(selected.id, { velocity: [v, selected.velocity[1], selected.velocity[2]] }),
    },
    vz: {
      value: selected.velocity[2],
      min: -10,
      max: 10,
      step: 0.1,
      onChange: (v: number) => updateMass(selected.id, { velocity: [selected.velocity[0], selected.velocity[1], v] }),
    },
    x: {
      value: selected.position[0],
      min: -20,
      max: 20,
      step: 0.1,
      onChange: (v: number) => updateMass(selected.id, { position: [v, selected.position[1], selected.position[2]] }),
    },
    z: {
      value: selected.position[2],
      min: -20,
      max: 20,
      step: 0.1,
      onChange: (v: number) => updateMass(selected.id, { position: [selected.position[0], selected.position[1], v] }),
    },
  } : {})

  useControls(selPhoton ? `Selected: Photon ${selPhoton.id}` : 'Photon', selPhoton ? {
    color: {
      value: selPhoton.color ?? '#66ccff',
      onChange: (v: string) => updatePhoton(selPhoton.id, { color: v }),
    },
    freq: {
      value: selPhoton.frequency ?? 1,
      min: 0.2,
      max: 5,
      step: 0.01,
      onChange: (v: number) => updatePhoton(selPhoton.id, { frequency: v }),
    },
    vx: { value: selPhoton.velocity[0], min: -10, max: 10, step: 0.1, onChange: (v: number) => updatePhoton(selPhoton.id, { velocity: [v, selPhoton.velocity[1], selPhoton.velocity[2]] }) },
    vz: { value: selPhoton.velocity[2], min: -10, max: 10, step: 0.1, onChange: (v: number) => updatePhoton(selPhoton.id, { velocity: [selPhoton.velocity[0], selPhoton.velocity[1], v] }) },
    x:  { value: selPhoton.position[0], min: -40, max: 40, step: 0.1, onChange: (v: number) => updatePhoton(selPhoton.id, { position: [v, selPhoton.position[1], selPhoton.position[2]] }) },
    z:  { value: selPhoton.position[2], min: -40, max: 40, step: 0.1, onChange: (v: number) => updatePhoton(selPhoton.id, { position: [selPhoton.position[0], selPhoton.position[1], v] }) },
  } : {})

  useControls(selClock ? `Selected: Clock ${selClock.id}` : 'Clock', selClock ? {
    color: { value: selClock.color ?? '#ffffff', onChange: (v: string) => updateClock(selClock.id, { color: v }) },
    x:  { value: selClock.position[0], min: -40, max: 40, step: 0.1, onChange: (v: number) => updateClock(selClock.id, { position: [v, selClock.position[1], selClock.position[2]] }) },
    z:  { value: selClock.position[2], min: -40, max: 40, step: 0.1, onChange: (v: number) => updateClock(selClock.id, { position: [selClock.position[0], selClock.position[1], v] }) },
  } : {})

  useControls(selBody ? `Selected: TestBody ${selBody.id}` : 'Test Body', selBody ? {
    mass: { value: selBody.mass, min: 0.001, max: 10, step: 0.001, onChange: (v: number) => updateTestBody(selBody.id, { mass: v }) },
    color: { value: selBody.color ?? '#aaff66', onChange: (v: string) => updateTestBody(selBody.id, { color: v }) },
    vx: { value: selBody.velocity[0], min: -10, max: 10, step: 0.1, onChange: (v: number) => updateTestBody(selBody.id, { velocity: [v, selBody.velocity[1], selBody.velocity[2]] }) },
    vz: { value: selBody.velocity[2], min: -10, max: 10, step: 0.1, onChange: (v: number) => updateTestBody(selBody.id, { velocity: [selBody.velocity[0], selBody.velocity[1], v] }) },
    x:  { value: selBody.position[0], min: -40, max: 40, step: 0.1, onChange: (v: number) => updateTestBody(selBody.id, { position: [v, selBody.position[1], selBody.position[2]] }) },
    z:  { value: selBody.position[2], min: -40, max: 40, step: 0.1, onChange: (v: number) => updateTestBody(selBody.id, { position: [selBody.position[0], selBody.position[1], v] }) },
    useGR: { value: selBody.useGR ?? false, onChange: (v: boolean) => updateTestBody(selBody.id, { useGR: v }) },
  } : {})

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <RelativityScene />
      <Leva collapsed oneLineLabels />
    </div>
  )
}

export default App
