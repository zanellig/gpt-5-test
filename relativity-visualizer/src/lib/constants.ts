// Simulation constants (scaled for interactive visualization)
// Real-world values are impractical at interactive scales, so we use unitless/scaled values.

export const G_SIM = 1.0; // Gravitational constant in sim units
export const C_SIM = 10.0; // Speed of light in sim units

// Integration
export const DEFAULT_DT = 0.016; // seconds per frame (simulation time)
export const MAX_SUBSTEPS = 4; // limit for stability

// Visuals
export const GRID_SIZE = 40; // world units
export const GRID_RESOLUTION = 128; // segments per side (power of two preferred)
export const GRID_HEIGHT_SCALE = 2.5; // multiplier for visual displacement from potential

export const MAX_MASSES = 16; // cap for shader uniform arrays

export const DEFAULT_MASS = 5.0; // mass units
export const DEFAULT_PHOTON_SPEED = C_SIM;

export const EPSILON = 0.1; // softening length to avoid singularities


