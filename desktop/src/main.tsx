import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode removed to prevent double-mounting of terminal components
createRoot(document.getElementById('root')!).render(
  <App />,
)
