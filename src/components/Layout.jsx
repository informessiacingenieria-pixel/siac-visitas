import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout({ setUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('siac_user')
    setUser(null)
    navigate('/login')
  }

  const navItem = (to, icon, label, end = false) => (
    <NavLink to={to} end={end} className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-white/20 text-white shadow-sm'
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`
    }>
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col shadow-xl" style={{background: 'linear-gradient(160deg, #0f4c8a 0%, #0a7fa8 50%, #06b6c4 100%)'}}>
        {/* Logo */}
        <div className="flex items-center justify-center py-6 px-4 border-b border-white/10">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
            <img
              src="/logo-siac.png"
              alt="SIAC Ingeniería"
              className="h-14 w-auto"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {navItem('/', '🏠', 'Inicio', true)}
          {navItem('/visitas', '📋', 'Visitas')}
          {navItem('/centros', '🏥', 'Centros')}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all"
          >
            <span className="text-lg">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
          <p className="text-sm text-gray-400">Sistema de visitas técnicas</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200">
            <span className="text-sm">👤</span>
            <span className="text-sm text-gray-600 font-medium">Jefe de Operaciones</span>
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}