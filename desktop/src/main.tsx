import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode removed to prevent double-mounting of terminal components
const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <App />,
)
