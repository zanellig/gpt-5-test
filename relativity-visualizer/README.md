# Relativity Visualizer (React + Three.js + R3F)

Interactive demonstrations of General Relativity concepts:

- Curvature of spacetime: a shader-displaced grid based on gravitational potential from masses
- Gravitational lensing: photons deflected by massive bodies (approximate)
- Gravitational time dilation: clocks tick slower in deeper potentials (weak-field approx)

## Tech

- React + TypeScript (Vite)
- three.js with @react-three/fiber and @react-three/drei
- leva for UI controls
- zustand for app state

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Controls

- Use the Leva panels:
  - Simulation: Play/Pause, Reset, dt, spawn photons/clocks/masses
  - Modes: Select, Add Mass/Clock/Photon; click the plane to place
  - Selected: when a mass is selected, adjust mass and position

## Notes

- Physics uses scaled, approximate formulas for interactivity. Not numerically accurate GR.
- Time dilation uses weak-field factor: sqrt(1 + 2 Phi / c^2).
- Photons maintain constant speed and are redirected by gravitational acceleration.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
