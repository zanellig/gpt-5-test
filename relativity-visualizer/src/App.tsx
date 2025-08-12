import { useEffect } from 'react'
import { Leva, useControls, button } from 'leva'
import { RelativityScene } from './scene/RelativityScene'
import { useSimStore } from './state/store'
import './App.css'

function App() {
  const addMass = useSimStore((s) => s.addMass)
  const addPhoton = useSimStore((s) => s.addPhoton)
  const addClock = useSimStore((s) => s.addClock)
  const setPaused = useSimStore((s) => s.setPaused)
  const setDt = useSimStore((s) => s.setDt)
  const reset = useSimStore((s) => s.reset)

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
  })

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <RelativityScene />
      <Leva collapsed oneLineLabels />
    </div>
  )
}

export default App
