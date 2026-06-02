import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Visitas from './pages/Visitas'
import NuevaVisita from './pages/Nuevavisita'
import Centros from './pages/Centros'
import Layout from './components/Layout'
import DetalleVisita from './pages/DetalleVisita'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('siac_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Layout setUser={setUser} /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="visitas" element={<Visitas />} />
        <Route path="visitas/nueva" element={<NuevaVisita />} />
        <Route path="centros" element={<Centros />} />
        <Route path="visitas/:id" element={<DetalleVisita />} />
      </Route>
    </Routes>
  )
}