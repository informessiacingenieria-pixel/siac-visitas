import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Visitas() {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [mesSeleccionado, setMesSeleccionado] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchVisitas() }, [])

  const fetchVisitas = async () => {
    const { data } = await supabase
      .from('visitas')
      .select('id, numero_visita, fecha, estado_cobro, centros(nombre), tecnicos(nombre), repuestos_visita(id)')
      .order('fecha', { ascending: false })
    setVisitas(data || [])
    setLoading(false)
  }

  const cambiarEstado = async (id, nuevoEstado, e) => {
    e.stopPropagation()
    await supabase.from('visitas').update({ estado_cobro: nuevoEstado }).eq('id', id)
    fetchVisitas()
  }

  // Obtener meses únicos de las visitas
  const mesesDisponibles = [...new Set(visitas.map(v => {
    const d = new Date(v.fecha)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }))].sort((a, b) => b.localeCompare(a))

  const nombreMes = (mesStr) => {
    const [year, month] = mesStr.split('-')
    const fecha = new Date(year, month - 1)
    return fecha.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  }

  const visitasFiltradas = visitas.filter(v => {
    const d = new Date(v.fecha)
    const mesVisita = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const pasaMes = mesSeleccionado ? mesVisita === mesSeleccionado : true
    if (!pasaMes) return false
    if (filtro === 'con_repuestos') return v.repuestos_visita.length > 0
    if (filtro === 'pendiente') return v.estado_cobro === 'pendiente' && v.repuestos_visita.length > 0
    if (filtro === 'cobrado') return v.estado_cobro === 'cobrado'
    return true
  })

  const filtros = [
    { key: 'todos', label: 'Todas', count: visitas.filter(v => {
      if (!mesSeleccionado) return true
      const d = new Date(v.fecha)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === mesSeleccionado
    }).length },
    { key: 'con_repuestos', label: 'Con repuestos', count: visitasFiltradas.filter(v => v.repuestos_visita.length > 0).length },
    { key: 'pendiente', label: 'Pendientes', count: visitasFiltradas.filter(v => v.estado_cobro === 'pendiente' && v.repuestos_visita.length > 0).length },
    { key: 'cobrado', label: 'Cobradas', count: visitasFiltradas.filter(v => v.estado_cobro === 'cobrado').length },
  ]

  const estadoBadge = (estado, tieneRepuestos) => {
    if (!tieneRepuestos) return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">Sin repuestos</span>
    if (estado === 'cobrado') return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Cobrado</span>
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pendiente</span>
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitas</h1>
          <p className="text-gray-400 text-sm mt-1">{visitasFiltradas.length} visitas encontradas</p>
        </div>
        <button
          onClick={() => navigate('/visitas/nueva')}
          className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200">
          + Nueva visita
        </button>
      </div>

      {/* Filtro por mes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">📅 Mes:</span>
        <select
          value={mesSeleccionado}
          onChange={e => setMesSeleccionado(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
          <option value="">Todos los meses</option>
          {mesesDisponibles.map(mes => (
            <option key={mes} value={mes}>{nombreMes(mes)}</option>
          ))}
        </select>
        {mesSeleccionado && (
          <button onClick={() => setMesSeleccionado('')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            × Limpiar
          </button>
        )}
      </div>

      {/* Filtros estado */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filtros.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              filtro === f.key
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              filtro === f.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {visitasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 text-sm">No hay visitas en esta categoría</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">N° Visita</th>
                <th className="px-6 py-3 font-medium">Centro</th>
                <th className="px-6 py-3 font-medium">Técnico</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Repuestos</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {visitasFiltradas.map(v => (
                <tr key={v.id}
                  className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/visitas/${v.id}`)}>
                  <td className="px-6 py-4 font-semibold text-blue-600">#{v.numero_visita}</td>
                  <td className="px-6 py-4 text-gray-600">{v.centros?.nombre || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{v.tecnicos?.nombre || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(v.fecha).toLocaleDateString('es-CL')}</td>
                  <td className="px-6 py-4">
                    {v.repuestos_visita.length > 0
                      ? <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-medium">{v.repuestos_visita.length} repuesto{v.repuestos_visita.length > 1 ? 's' : ''}</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="px-6 py-4">{estadoBadge(v.estado_cobro, v.repuestos_visita.length > 0)}</td>
                  <td className="px-6 py-4">
                    {v.repuestos_visita.length > 0 && v.estado_cobro !== 'cobrado' && (
                      <button
                        onClick={(e) => cambiarEstado(v.id, 'cobrado', e)}
                        className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium border border-green-100">
                        ✓ Marcar cobrado
                      </button>
                    )}
                    {v.estado_cobro === 'cobrado' && (
                      <button
                        onClick={(e) => cambiarEstado(v.id, 'pendiente', e)}
                        className="text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-200">
                        Desmarcar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}