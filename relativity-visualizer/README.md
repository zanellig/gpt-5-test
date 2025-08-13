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

### Newly added

- Special relativity (SR) time dilation: moving clocks accumulate proper time using γ; combines with gravitational factor.
- 1PN-like corrections for massive bodies: produces Mercury-like pericenter advance when enabled.
- Improved photon paths: perpendicular deflection, frame dragging tweak, and Shapiro-like coordinate delay.
- Redshift coloring: photon frequency proxy advects with potential; color shifts indicate red/blue shift.
- GW inspiral proxy chirp: frequency/amplitude increase as separation shrinks; optional audio tone.
- Adaptive substepping: per-frame step subdivides based on speeds to improve stability near strong fields.

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
- Physics toggles: Enable SR, Enable 1PN, Adaptive Timestep (with Max Substeps), GW Audio.
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
- Time dilation combines weak‑field gravitational factor with SR γ from velocity; both use scene‑scaled constants.
- 1PN corrections are simplified and tuned for visual precession, not for precise ephemerides.
- Photon bending and Shapiro delay are approximate; full null geodesics in Kerr/Schwarzschild are not solved.
- GW audio is a simple tone mapped from separation; browsers may require a user gesture before audio can start.
- Adaptive substepping aims for stability but is not a symplectic integrator.
