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
  const setPaused = useSimStore((s) => s.setPaused)
  const setDt = useSimStore((s) => s.setDt)
  const reset = useSimStore((s) => s.reset)
  const uiMode = useSimStore((s) => s.uiMode)
  const setUiMode = useSimStore((s) => s.setUiMode)
  const masses = useSimStore((s) => s.masses)
  const selectedMassId = useSimStore((s) => s.selectedMassId)
  const updateMass = useSimStore((s) => s.updateMass)

  useEffect(() => {
    // Seed initial scene
    if (useSimStore.getState().masses.length === 0) {
      addMass({ name: 'Black Hole', mass: 20, position: [0, 0, 0], color: '#ff8800' })
      addClock({ position: [5, 0, 0], color: '#00ff88' })
      addClock({ position: [10, 0, 0], color: '#ffffff' })
    }
  }, [])

  useControls('Simulation', {
    Pause: button(() => setPaused(true)),
    Play: button(() => setPaused(false)),
    'Reset Scene': button(() => {
      reset()
      addMass({ name: 'Black Hole', mass: 20, position: [0, 0, 0], color: '#ff8800' })
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
  })

  useControls('Modes', {
    Mode: {
      value: uiMode,
      options: {
        Select: 'select',
        'Add Mass': 'addMass',
        'Add Clock': 'addClock',
        'Add Photon': 'addPhoton',
      },
      onChange: (v: any) => setUiMode(v),
    },
  })

  const selected = masses.find((m) => m.id === selectedMassId)
  useControls(selected ? `Selected: ${selected.name}` : 'Selected', selected ? {
    name: { value: selected.name },
    mass: {
      value: selected.mass,
      min: 0.5,
      max: 50,
      step: 0.5,
      onChange: (v: number) => updateMass(selected.id, { mass: v }),
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

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <RelativityScene />
      <Leva collapsed oneLineLabels />
    </div>
  )
}

export default App
