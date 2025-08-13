# Relativity Visualizer (React + Three.js + R3F)

Interactive simulation of General Relativity concepts with real‑time visuals and controls.

## Core features

- Curved spacetime grid: shader-displaced plane using gravitational potential from masses.
- Photon deflection (gravitational lensing, approximate): photons travel at constant c and bend under gravity.
- Gravitational time dilation: clocks tick slower in deeper potentials (weak-field approximation).
- Frame dragging (Lense–Thirring, stylized): spinning masses induce small velocity drags on photons and bodies.
- Perihelion precession demo: enable GR-inspired correction and compare to Newtonian-like motion; adjustable strength.
- Black hole visuals (Kerr-inspired): event horizon and equatorial static limit (ergosphere) approximations; spin axis orientation.
- Gravitational waves visualization: expanding ring from the midpoint of the two most massive bodies; toggleable.
- Trails: optional trajectory trail for GR demo bodies.

## Dynamic interactions and events

When massive bodies collide or merge, the simulation spawns physical outcomes and transient visuals:

- Black hole + black hole → merged black hole + gravitational wave burst ring.
- Neutron star + neutron star → kilonova; collapses to black hole if total mass exceeds a TOV-like threshold.
- Black hole + star/planet → tidal disruption and accretion; the BH accretes mass and spin, with a transient accretion disk.
- Star + star → merged, hotter star with an explosion effect.
- Planetary collisions (or planet–star impact) → merged body with a debris ring.

## HUD and analysis

- Select a mass to see an overlay with: position, velocity, mass, spin, gravitational potential Φ, time‑dilation factor dτ/dt, and approximate orbital elements (a, e, rp, ra) relative to the nearest mass.
- For black holes, HUD also shows Kerr-inspired radii: r+ (horizon) and equatorial static limit.
- First‑person camera includes a local clock HUD showing accumulated proper time and instantaneous dτ/dt at the camera position.

## Controls (Leva panels)

- Simulation: Play, Pause, Reset Scene, Time Step (dt), quick spawners for photons (left/right), random ring clocks, planets, and test body.
- Modes: Select, Add Mass, Add Clock, Add Photon. Click on the ground plane to place.
- View: God View (orbit controls) or First Person.
- Toggles: Black Hole Visuals, Gravitational Waves, Precession Demo, GR Precession Factor.
- Selected mass: edit name, mass, black hole toggle, spinY, velocity (vx, vz), and position (x, z).

### Built-in scenarios

- Spawn Inspiral (GW): two black holes on inspiral with GW visualization enabled.
- Precession Orbit (GR): central star with a light test body on a precessing orbit.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Tech

- React + TypeScript (Vite)
- three.js with @react-three/fiber and @react-three/drei
- leva for UI controls
- zustand for app state

## Notes and limitations

- Physics is scaled and approximate for interactivity. It is not a numerically accurate GR solver.
- Time dilation uses the weak‑field factor: sqrt(1 + 2 Φ / c²) with scene‑scaled constants.
- Frame dragging and precession are stylized approximations.
