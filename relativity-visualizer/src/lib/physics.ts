import { EPSILON, G_SIM, C_SIM, FRAME_DRAG_SCALE } from './constants'
import type { MassBody, Photon, GravClock, Vector3Tuple, TestBody, SimConfig } from '../state/store'

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

export function cross(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export function dot(a: Vector3Tuple, b: Vector3Tuple): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
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

// Approximate frame-dragging (Lense-Thirring) velocity change
// Using a stylized angular velocity field Omega ~ (G J)/(c^2 r^3), with J ~ m * spin
export function frameDraggingDeltaV(point: Vector3Tuple, velocity: Vector3Tuple, masses: MassBody[], dt: number): Vector3Tuple {
  let dvx = 0, dvy = 0, dvz = 0
  for (const m of masses) {
    const spin = m.spin ?? [0, 0, 0]
    const dx = point[0] - m.position[0]
    const dy = point[1] - m.position[1]
    const dz = point[2] - m.position[2]
    const r2 = dx * dx + dy * dy + dz * dz + EPSILON * EPSILON
    const r = Math.sqrt(r2)
    const r3 = r2 * r
    const spinMag = Math.max(0, Math.min(0.99, length(spin)))
    if (spinMag <= 0.0001) continue
    const omegaScale = FRAME_DRAG_SCALE * (G_SIM * m.mass) / (C_SIM * C_SIM * r3)
    const omega = scale(normalize(spin), omegaScale * m.mass) // stylized
    const dv = cross(omega as Vector3Tuple, velocity)
    dvx += dv[0] * dt
    dvy += dv[1] * dt
    dvz += dv[2] * dt
  }
  return [dvx, dvy, dvz]
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
export function stepPhoton(photon: Photon, masses: MassBody[], dt: number, config?: SimConfig): Photon {
  const a = gravitationalAcceleration(photon.position, masses)
  let newVel = add(photon.velocity, scale(a, dt))
  // frame-dragging tweak
  const dVfd = frameDraggingDeltaV(photon.position, newVel, masses, dt)
  newVel = add(newVel, dVfd)
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

export function stepTestBody(body: TestBody, masses: MassBody[], dt: number, config?: SimConfig): TestBody {
  let a = gravitationalAcceleration(body.position, masses)
  // GR-inspired perihelion precession correction (stylized)
  const useGR = (body as any).useGR === true
  if (useGR && config?.precessionDemoEnabled) {
    let axT = 0, ayT = 0, azT = 0
    for (const m of masses) {
      const rVec: Vector3Tuple = subtract(body.position, m.position)
      const r = length(rVec) + EPSILON
      const rHat = normalize(rVec)
      const L = cross(rVec, body.velocity)
      const Lhat = normalize(L)
      const tHat = normalize(cross(Lhat, rHat))
      // scale ~ (GM/c^2) * (GM/r^3)
      const rs = 2 * G_SIM * m.mass / (C_SIM * C_SIM)
      const mag = (config?.grPrecessionFactor ?? 0.1) * (G_SIM * m.mass / (r * r)) * (rs / r)
      axT += tHat[0] * mag
      ayT += tHat[1] * mag
      azT += tHat[2] * mag
    }
    a = add(a, [axT, ayT, azT])
  }

  // frame-dragging delta-v
  const dVfd = frameDraggingDeltaV(body.position, body.velocity, masses, dt)
  let newVel = add(body.velocity, dVfd)
  newVel = add(newVel, scale(a, dt))
  const pos = add(body.position, scale(newVel, dt))
  return { ...body, velocity: newVel, position: pos }
}

export function stepMass(body: MassBody, masses: MassBody[], dt: number): MassBody {
  // Exclude self for pairwise gravity
  const others = masses.filter((m) => m.id !== body.id)
  const a = gravitationalAcceleration(body.position, others)
  const newVel = add(body.velocity, scale(a, dt))
  const pos = add(body.position, scale(newVel, dt))
  return { ...body, velocity: newVel, position: pos }
}

// Collision detection helpers
export function bodyRadiusApprox(m: MassBody): number {
  // Stylized radii per kind
  const base = Math.cbrt(Math.max(0.0001, m.mass))
  const kind = m.kind ?? (m.isBlackHole ? 'blackHole' : 'star')
  switch (kind) {
    case 'blackHole':
      return 0.2 * base
    case 'neutronStar':
      return 0.35 * base
    case 'planet':
      return 0.4 * base
    case 'star':
    default:
      return 0.6 * base
  }
}

export function distance(a: Vector3Tuple, b: Vector3Tuple): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}



