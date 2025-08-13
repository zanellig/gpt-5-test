import { create } from 'zustand'
import { C_SIM, DEFAULT_DT } from '../lib/constants'

export type Vector3Tuple = [number, number, number]

export interface MassBody {
  id: string
  name: string
  mass: number
  position: Vector3Tuple
  velocity: Vector3Tuple
  color?: string
  // Dimensionless spin vector (Kerr a parameter direction). Magnitude clamped to [0, 0.99]
  spin?: Vector3Tuple
  // Render Kerr visuals (horizon/ergosphere)
  isBlackHole?: boolean
  // Physical classification for interactions
  kind?: 'blackHole' | 'neutronStar' | 'star' | 'planet'
}

export interface Photon {
  id: string
  position: Vector3Tuple
  velocity: Vector3Tuple // magnitude maintained at C_SIM
  color?: string
  // Render/physics frequency proxy (unitless). Used for Doppler/redshift coloring.
  frequency?: number
}

export interface TestBody {
  id: string
  position: Vector3Tuple
  velocity: Vector3Tuple
  mass: number
  color?: string
  // For demos
  useGR?: boolean
  // Proper time accumulator for SR/GR display
  properTime?: number
}

export interface GravClock {
  id: string
  position: Vector3Tuple
  properTime: number
  color?: string
  // Optional kinematic velocity for SR dilation; if absent, treated as stationary
  velocity?: Vector3Tuple
}

export interface SimConfig {
  dt: number
  paused: boolean
  // Camera/view
  viewMode: 'god' | 'firstPerson'
  lensingStrength: number
  // Visual feature toggles
  showBlackHoleVisuals: boolean
  showGravitationalWaves: boolean
  // Precession demo
  precessionDemoEnabled: boolean
  grPrecessionFactor: number
  // Physics toggles
  enableSR: boolean
  enable1PN: boolean
  adaptiveTimestep: boolean
  maxSubsteps: number
  // Audio
  gwAudioEnabled: boolean
}

export interface SimState {
  config: SimConfig
  masses: MassBody[]
  photons: Photon[]
  clocks: GravClock[]
  testBodies: TestBody[]
  effects: Effect[]
  uiMode: 'select' | 'addMass' | 'addClock' | 'addPhoton' | 'addTestBody'
  selectedMassId?: string
  selectedTestBodyId?: string
  selectedPhotonId?: string
  selectedClockId?: string
  observer?: { kind: 'mass' | 'testBody' | 'photon'; id: string }

  addMass: (partial?: Partial<MassBody>) => string
  updateMass: (id: string, partial: Partial<MassBody>) => void
  removeMass: (id: string) => void

  addPhoton: (partial?: Partial<Photon>) => string
  updatePhoton: (id: string, partial: Partial<Photon>) => void
  removePhoton: (id: string) => void

  addClock: (partial?: Partial<GravClock>) => string
  updateClock: (id: string, partial: Partial<GravClock>) => void
  removeClock: (id: string) => void

  addTestBody: (partial?: Partial<TestBody>) => string
  updateTestBody: (id: string, partial: Partial<TestBody>) => void
  removeTestBody: (id: string) => void

  setPaused: (paused: boolean) => void
  setDt: (dt: number) => void
  setViewMode: (mode: SimConfig['viewMode']) => void
  setObserver: (observer?: { kind: 'mass' | 'testBody' | 'photon'; id: string }) => void
  setConfig: (partial: Partial<SimConfig>) => void
  reset: () => void

  setUiMode: (mode: SimState['uiMode']) => void
  setSelectedMassId: (id?: string) => void
  setSelectedTestBodyId: (id?: string) => void
  setSelectedPhotonId: (id?: string) => void
  setSelectedClockId: (id?: string) => void
  addEffect: (e: EffectInput) => string
  removeEffect: (id: string) => void
}
export interface EffectBase {
  id: string
  type: 'waveBurst' | 'kilonova' | 'accretionDisk' | 'explosion' | 'debrisRing' | 'tidalStream'
  createdAt: number
}

export type Effect =
  | (EffectBase & { type: 'waveBurst'; origin: Vector3Tuple; amplitude: number; ttl: number })
  | (EffectBase & { type: 'kilonova'; origin: Vector3Tuple; color?: string; ttl: number })
  | (EffectBase & { type: 'accretionDisk'; massId: string; radius: number; ttl: number })
  | (EffectBase & { type: 'explosion'; origin: Vector3Tuple; color?: string; ttl: number })
  | (EffectBase & { type: 'debrisRing'; massId: string; inner: number; outer: number; ttl: number })
  | (EffectBase & { type: 'tidalStream'; from: Vector3Tuple; toMassId: string; ttl: number })

export type EffectInput =
  | { type: 'waveBurst'; origin: Vector3Tuple; amplitude: number; ttl: number }
  | { type: 'kilonova'; origin: Vector3Tuple; color?: string; ttl: number }
  | { type: 'accretionDisk'; massId: string; radius: number; ttl: number }
  | { type: 'explosion'; origin: Vector3Tuple; color?: string; ttl: number }
  | { type: 'debrisRing'; massId: string; inner: number; outer: number; ttl: number }
  | { type: 'tidalStream'; from: Vector3Tuple; toMassId: string; ttl: number }


let idCounter = 0
const nextId = () => `${++idCounter}`

export const useSimStore = create<SimState>((set) => ({
  config: {
    dt: DEFAULT_DT,
    paused: false,
    viewMode: 'god',
    lensingStrength: 0.6,
    showBlackHoleVisuals: true,
    showGravitationalWaves: false,
    precessionDemoEnabled: false,
    grPrecessionFactor: 0.15,
    enableSR: true,
    enable1PN: true,
    adaptiveTimestep: true,
    maxSubsteps: 4,
    gwAudioEnabled: false,
  },
  masses: [],
  photons: [],
  clocks: [],
  testBodies: [],
  effects: [],
  uiMode: 'select',
  selectedMassId: undefined,
  selectedTestBodyId: undefined,
  selectedPhotonId: undefined,
  selectedClockId: undefined,
  observer: undefined,

  addMass: (partial) => {
    const id = nextId()
    const mass: MassBody = {
      id,
      name: partial?.name ?? `Mass ${id}`,
      mass: partial?.mass ?? 5,
      position: partial?.position ?? [0, 0, 0],
      velocity: partial?.velocity ?? [0, 0, 0],
      color: partial?.color ?? '#ffaa00',
      spin: partial?.spin ?? [0, 0.2, 0],
      isBlackHole: partial?.isBlackHole ?? false,
      kind:
        partial?.kind ?? (partial?.isBlackHole ? 'blackHole' : (partial?.name?.toLowerCase().includes('planet') ? 'planet' : 'star')),
    }
    set((s) => ({ masses: [...s.masses, mass] }))
    return id
  },

  updateMass: (id, partial) =>
    set((s) => ({
      masses: s.masses.map((m) => (m.id === id ? { ...m, ...partial } : m)),
    })),

  removeMass: (id) => set((s) => ({ masses: s.masses.filter((m) => m.id !== id) })),

  addPhoton: (partial) => {
    const id = nextId()
    const velocity = partial?.velocity ?? [C_SIM, 0, 0]
    const photon: Photon = {
      id,
      position: partial?.position ?? [-10, 0, 0],
      velocity,
      color: partial?.color ?? '#66ccff',
      frequency: partial?.frequency ?? 1.0,
    }
    set((s) => ({ photons: [...s.photons, photon] }))
    return id
  },

  updatePhoton: (id, partial) =>
    set((s) => ({
      photons: s.photons.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),

  removePhoton: (id) => set((s) => ({ photons: s.photons.filter((p) => p.id !== id) })),

  addClock: (partial) => {
    const id = nextId()
    const clock: GravClock = {
      id,
      position: partial?.position ?? [0, 0, 0],
      properTime: partial?.properTime ?? 0,
      color: partial?.color ?? '#ffffff',
      velocity: partial?.velocity,
    }
    set((s) => ({ clocks: [...s.clocks, clock] }))
    return id
  },

  updateClock: (id, partial) =>
    set((s) => ({
      clocks: s.clocks.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    })),

  removeClock: (id) => set((s) => ({ clocks: s.clocks.filter((c) => c.id !== id) })),

  addTestBody: (partial) => {
    const id = nextId()
    const body: TestBody = {
      id,
      mass: partial?.mass ?? 1,
      position: partial?.position ?? [-10, 0, 0],
      velocity: partial?.velocity ?? [5, 0, 0],
      color: partial?.color ?? '#aaff66',
      properTime: 0,
    }
    set((s) => ({ testBodies: [...s.testBodies, body] }))
    return id
  },
  updateTestBody: (id, partial) =>
    set((s) => ({ testBodies: s.testBodies.map((b) => (b.id === id ? { ...b, ...partial } : b)) })),
  removeTestBody: (id) => set((s) => ({ testBodies: s.testBodies.filter((b) => b.id !== id) })),

  setPaused: (paused) => set((s) => ({ config: { ...s.config, paused } })),
  setDt: (dt) => set((s) => ({ config: { ...s.config, dt } })),
  setViewMode: (mode) => set((s) => ({ config: { ...s.config, viewMode: mode } })),
  setObserver: (observer) => set({ observer }),
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  reset: () => set({
    masses: [],
    photons: [],
    clocks: [],
    testBodies: [],
    effects: [],
    selectedMassId: undefined,
    selectedTestBodyId: undefined,
    selectedPhotonId: undefined,
    selectedClockId: undefined,
    observer: undefined,
  }),

  setUiMode: (mode) => set({ uiMode: mode }),
  setSelectedMassId: (id) => set({ selectedMassId: id }),
  setSelectedTestBodyId: (id) => set({ selectedTestBodyId: id }),
  setSelectedPhotonId: (id) => set({ selectedPhotonId: id }),
  setSelectedClockId: (id) => set({ selectedClockId: id }),
  addEffect: (e) => {
    const id = nextId()
    const eff: Effect = { ...(e as any), id, createdAt: performance.now() }
    set((s) => ({ effects: [...s.effects, eff] }))
    return id
  },
  removeEffect: (id) => set((s) => ({ effects: s.effects.filter((x) => x.id !== id) })),
}))


