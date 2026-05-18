import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVisitas: 0,
    visitasConRepuestos: 0,
    pendientesCobro: 0,
    cobrados: 0,
  })
  const [ultimasVisitas, setUltimasVisitas] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    const { data: visitas } = await supabase
      .from('visitas')
      .select('id, estado_cobro, repuestos_visita(id)')

    if (visitas) {
      const conRepuestos = visitas.filter(v => v.repuestos_visita.length > 0)
      setStats({
        totalVisitas: visitas.length,
        visitasConRepuestos: conRepuestos.length,
        pendientesCobro: visitas.filter(v => v.estado_cobro === 'pendiente' && v.repuestos_visita.length > 0).length,
        cobrados: visitas.filter(v => v.estado_cobro === 'cobrado').length,
      })
    }

    const { data: ultimas } = await supabase
      .from('visitas')
      .select('id, numero_visita, fecha, estado_cobro, centros(nombre), tecnicos(nombre), repuestos_visita(id)')
      .order('created_at', { ascending: false })
      .limit(5)

    if (ultimas) setUltimasVisitas(ultimas)
    setLoading(false)
  }

  const kpis = [
    { label: 'Total visitas', value: stats.totalVisitas, icon: '📋', color: 'blue', sub: 'registradas' },
    { label: 'Con repuestos', value: stats.visitasConRepuestos, icon: '🔧', color: 'indigo', sub: 'visitas' },
    { label: 'Pendientes cobro', value: stats.pendientesCobro, icon: '⏳', color: 'amber', sub: 'por cobrar' },
    { label: 'Cobrados', value: stats.cobrados, icon: '✅', color: 'green', sub: 'completados' },
  ]

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  }

  const estadoBadge = (estado, tieneRepuestos) => {
    if (!tieneRepuestos) return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">Sin repuestos</span>
    if (estado === 'cobrado') return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Cobrado</span>
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pendiente</span>
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 text-sm">Cargando...</div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Resumen general de informes y visitas técnicas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${colorMap[k.color]}`}>
              {k.icon}
            </div>
            <p className="text-3xl font-bold text-gray-800">{k.value}</p>
            <p className="text-sm text-gray-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Últimas visitas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-50">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Últimas visitas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Las 5 más recientes</p>
          </div>
          <button
            onClick={() => navigate('/visitas/nueva')}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200">
            + Nueva visita
          </button>
        </div>

        {ultimasVisitas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 text-sm">No hay visitas registradas aún</p>
            <button onClick={() => navigate('/visitas/nueva')}
              className="mt-4 text-blue-600 text-sm font-medium hover:underline">
              Crear primera visita →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-50">
                <th className="px-6 py-3 font-medium">N° Visita</th>
                <th className="px-6 py-3 font-medium">Centro</th>
                <th className="px-6 py-3 font-medium">Técnico</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVisitas.map(v => (
                <tr key={v.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/visitas/${v.id}`)}>
                  <td className="px-6 py-4 font-semibold text-blue-600">#{v.numero_visita}</td>
                  <td className="px-6 py-4 text-gray-600">{v.centros?.nombre || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{v.tecnicos?.nombre || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(v.fecha).toLocaleDateString('es-CL')}</td>
                  <td className="px-6 py-4">{estadoBadge(v.estado_cobro, v.repuestos_visita.length > 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}