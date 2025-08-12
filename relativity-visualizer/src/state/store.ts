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
}

export interface Photon {
  id: string
  position: Vector3Tuple
  velocity: Vector3Tuple // magnitude maintained at C_SIM
  color?: string
}

export interface TestBody {
  id: string
  position: Vector3Tuple
  velocity: Vector3Tuple
  mass: number
  color?: string
}

export interface GravClock {
  id: string
  position: Vector3Tuple
  properTime: number
  color?: string
}

export interface SimConfig {
  dt: number
  paused: boolean
}

export interface SimState {
  config: SimConfig
  masses: MassBody[]
  photons: Photon[]
  clocks: GravClock[]
  testBodies: TestBody[]
  uiMode: 'select' | 'addMass' | 'addClock' | 'addPhoton'
  selectedMassId?: string
  selectedTestBodyId?: string

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
  reset: () => void

  setUiMode: (mode: SimState['uiMode']) => void
  setSelectedMassId: (id?: string) => void
  setSelectedTestBodyId: (id?: string) => void
}

let idCounter = 0
const nextId = () => `${++idCounter}`

export const useSimStore = create<SimState>((set) => ({
  config: { dt: DEFAULT_DT, paused: false },
  masses: [],
  photons: [],
  clocks: [],
  testBodies: [],
  uiMode: 'select',
  selectedMassId: undefined,
  selectedTestBodyId: undefined,

  addMass: (partial) => {
    const id = nextId()
    const mass: MassBody = {
      id,
      name: partial?.name ?? `Mass ${id}`,
      mass: partial?.mass ?? 5,
      position: partial?.position ?? [0, 0, 0],
      velocity: partial?.velocity ?? [0, 0, 0],
      color: partial?.color ?? '#ffaa00',
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
    }
    set((s) => ({ testBodies: [...s.testBodies, body] }))
    return id
  },
  updateTestBody: (id, partial) =>
    set((s) => ({ testBodies: s.testBodies.map((b) => (b.id === id ? { ...b, ...partial } : b)) })),
  removeTestBody: (id) => set((s) => ({ testBodies: s.testBodies.filter((b) => b.id !== id) })),

  setPaused: (paused) => set((s) => ({ config: { ...s.config, paused } })),
  setDt: (dt) => set((s) => ({ config: { ...s.config, dt } })),
  reset: () => set({ masses: [], photons: [], clocks: [], testBodies: [], selectedMassId: undefined, selectedTestBodyId: undefined }),

  setUiMode: (mode) => set({ uiMode: mode }),
  setSelectedMassId: (id) => set({ selectedMassId: id }),
  setSelectedTestBodyId: (id) => set({ selectedTestBodyId: id }),
}))


