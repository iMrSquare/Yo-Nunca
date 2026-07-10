import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AdminRoot from './AdminRoot.tsx'

const isAdmin = window.location.pathname.startsWith('/adm')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <AdminRoot /> : <App />}
  </StrictMode>,
)
