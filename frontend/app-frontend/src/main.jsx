import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import { JwtProvider } from '@/context/jwtContext'
import './index.css' // Importar el archivo CSS global (Tailwind CSS)
import Rutas from './Rutas'

createRoot(document.getElementById('root')).render(
 
  <StrictMode>
      <BrowserRouter>
        <JwtProvider>
      <Rutas />
        </JwtProvider>
      </BrowserRouter>
  </StrictMode>
 
)
