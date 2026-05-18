import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Visitas from './pages/Visitas'
import NuevaVisita from './pages/Nuevavisita'
import Centros from './pages/Centros'
import Layout from './components/Layout'
import DetalleVisita from './pages/DetalleVisita'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={session ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="visitas" element={<Visitas />} />
        <Route path="visitas/nueva" element={<NuevaVisita />} />
        <Route path="centros" element={<Centros />} />
        <Route path="visitas/:id" element={<DetalleVisita />} />
      </Route>
    </Routes>
  )
}
