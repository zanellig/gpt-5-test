import { EPSILON, G_SIM, C_SIM } from './constants'
import type { MassBody, Photon, GravClock, Vector3Tuple } from '../state/store'

export function subtract(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}
export function add(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
export function scale(a: Vector3Tuple, s: number): Vector3Tuple {
  return [a[0] * s, a[1] * s, a[2] * s]
}
export function length(a: Vector3Tuple): number {
  return Math.hypot(a[0], a[1], a[2])
}
export function normalize(a: Vector3Tuple): Vector3Tuple {
  const len = length(a) || 1
  return [a[0] / len, a[1] / len, a[2] / len]
}

// Gravitational acceleration from a set of masses at a given point
export function gravitationalAcceleration(point: Vector3Tuple, masses: MassBody[]): Vector3Tuple {
  let ax = 0, ay = 0, az = 0
  for (const m of masses) {
    const dx = m.position[0] - point[0]
    const dy = m.position[1] - point[1]
    const dz = m.position[2] - point[2]
    const r2 = dx * dx + dy * dy + dz * dz + EPSILON * EPSILON
    const r = Math.sqrt(r2)
    const invR3 = 1 / (r2 * r)
    const factor = G_SIM * m.mass * invR3
    ax += dx * factor
    ay += dy * factor
    az += dz * factor
  }
  return [ax, ay, az]
}

// Gravitational potential Phi at a point (for curvature/time dilation visuals)
export function gravitationalPotential(point: Vector3Tuple, masses: MassBody[]): number {
  let phi = 0
  for (const m of masses) {
    const dx = m.position[0] - point[0]
    const dy = m.position[1] - point[1]
    const dz = m.position[2] - point[2]
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz + EPSILON * EPSILON)
    phi += -G_SIM * m.mass / r
  }
  return phi
}

// Update photon with Newtonian deflection approximation; speed maintained at C_SIM
export function stepPhoton(photon: Photon, masses: MassBody[], dt: number): Photon {
  const a = gravitationalAcceleration(photon.position, masses)
  // update velocity direction
  const newVel = add(photon.velocity, scale(a, dt))
  const dir = normalize(newVel)
  const vel = scale(dir, C_SIM)
  const pos = add(photon.position, scale(vel, dt))
  return { ...photon, velocity: vel, position: pos }
}

// Gravitational time dilation factor using weak-field approximation: sqrt(1 + 2 Phi / c^2)
export function timeDilationFactor(point: Vector3Tuple, masses: MassBody[]): number {
  const phi = gravitationalPotential(point, masses)
  const factor = Math.sqrt(Math.max(0.0, 1 + (2 * phi) / (C_SIM * C_SIM)))
  return factor
}

export function stepClock(clock: GravClock, masses: MassBody[], dt: number): GravClock {
  const factor = timeDilationFactor(clock.position, masses)
  return { ...clock, properTime: clock.properTime + dt * factor }
}


