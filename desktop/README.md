# React + TypeScript +# Squadron Desktop

A cross-platform desktop dashboard for Squadron, built with Electron, React, and Vite.

## Status: MVP

This application provides a GUI for the Squadron control plane. It automatically spawns the Python backend (`squadron.server`) when launched.

## Prerequisites

- **Node.js**: v18+
- **Python**: v3.10+ (Must be in your system PATH)
- **Squadron Dependencies**: The python environment must interpret `squadron` commands.
  ```bash
  pip install -e ..
  ```

## Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run in Development Mode:**
    ```bash
    npm run electron:dev
    ```
    This launches Vite for the frontend and Electron for the shell. It also spawns the Python backend from the `../squadron` directory.

## Building for Production

To create an installer (Windows .exe, Mac .dmg, or Linux .AppImage):

```bash
npm run electron:build
```

The output will be in the `release/` directory.

### How it works
The build process bundles the compiled frontend (`dist`), the electron main process (`dist-electron`), and copies the `squadron` python package into the app resources. This allows the app to run `python -m squadron.server` internally using the user's system Python.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

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

export default defineConfig([
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
