import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Importar el archivo CSS global (Tailwind CSS)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
)
