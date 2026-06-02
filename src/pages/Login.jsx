import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const USUARIOS = [
  { email: 'informessiacingenieria@gmail.com', password: 'Siac2026!' },
]

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    const usuario = USUARIOS.find(u => u.email === email && u.password === password)
    if (usuario) {
      const userData = { email }
      localStorage.setItem('siac_user', JSON.stringify(userData))
      setUser(userData)
      navigate('/')
    } else {
      setError('Email o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(160deg, #0f4c8a 0%, #0a7fa8 50%, #06b6c4 100%)'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 bg-white rounded-2xl px-6 py-4 shadow-lg">
            <img src="/logo-siac.png" alt="SIAC Ingeniería" className="h-20 w-auto" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Iniciar sesión</h2>
          <p className="text-gray-400 text-sm mb-6">Sistema de visitas técnicas</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••" required />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
            <button type="submit"
              className="mt-2 text-white rounded-xl py-3 text-sm font-semibold transition-colors shadow-md"
              style={{background: 'linear-gradient(90deg, #0f4c8a 0%, #0a7fa8 100%)'}}>
              Entrar
            </button>
          </form>
        </div>
        <p className="text-center text-blue-200 text-xs mt-6">SIAC Ingeniería SPA © 2026</p>
      </div>
    </div>
  )
}