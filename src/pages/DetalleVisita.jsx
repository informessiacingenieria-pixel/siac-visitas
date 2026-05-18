import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleVisita() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [visita, setVisita] = useState(null)
  const [repuestos, setRepuestos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchVisita() }, [])

  const fetchVisita = async () => {
    const { data } = await supabase
      .from('visitas')
      .select('*, centros(nombre), tecnicos(nombre)')
      .eq('id', id)
      .single()
    const { data: reps } = await supabase
      .from('repuestos_visita')
      .select('*')
      .eq('visita_id', id)
    setVisita(data)
    setRepuestos(reps || [])
    setLoading(false)
  }

  const cambiarEstado = async (nuevoEstado) => {
    await supabase.from('visitas').update({ estado_cobro: nuevoEstado }).eq('id', id)
    fetchVisita()
  }

  const eliminarVisita = async () => {
    if (!confirm('¿Estás seguro de eliminar esta visita? Esta acción no se puede deshacer.')) return
    await supabase.from('visitas').delete().eq('id', id)
    navigate('/visitas')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )
  if (!visita) return <p className="text-gray-500">Visita no encontrada</p>

  const esCobrado = visita.estado_cobro === 'cobrado'
  const tieneRepuestos = repuestos.length > 0

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/visitas')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1 transition-colors">
          ← Volver a visitas
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visita #{visita.numero_visita}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(visita.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
            esCobrado ? 'bg-green-100 text-green-700' :
            visita.estado_cobro === 'no_aplica' ? 'bg-gray-100 text-gray-500' :
            'bg-amber-100 text-amber-700'
          }`}>
            {esCobrado ? '✓ Cobrado' : visita.estado_cobro === 'no_aplica' ? 'No aplica' : '⏳ Pendiente'}
          </span>
        </div>
      </div>

      {/* Info general */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Información general</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">Centro / Cliente</p>
            <p className="font-semibold text-gray-800">{visita.centros?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Técnico</p>
            <p className="font-semibold text-gray-800">{visita.tecnicos?.nombre || '—'}</p>
          </div>
          {visita.oc && <div>
            <p className="text-xs text-gray-400 mb-1">O/C</p>
            <p className="font-semibold text-gray-800">{visita.oc}</p>
          </div>}
          {visita.solicitado_por && <div>
            <p className="text-xs text-gray-400 mb-1">Solicitado por</p>
            <p className="font-semibold text-gray-800">{visita.solicitado_por}</p>
          </div>}
          {visita.nombre_receptor && <div>
            <p className="text-xs text-gray-400 mb-1">Receptor</p>
            <p className="font-semibold text-gray-800">{visita.nombre_receptor}{visita.cargo_receptor ? ` (${visita.cargo_receptor})` : ''}</p>
          </div>}
        </div>
      </div>

      {/* Observaciones */}
      {visita.observaciones && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Observaciones</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{visita.observaciones}</p>
        </div>
      )}

      {/* Repuestos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Repuestos utilizados</h2>
        {!tieneRepuestos ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">🔧</p>
            <p className="text-gray-400 text-sm">No se registraron repuestos en esta visita</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {repuestos.map((r, i) => (
                  <tr key={r.id} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 text-gray-700">{r.descripcion}</td>
                    <td className="px-4 py-3 text-gray-700 text-right font-medium">{r.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones cobro */}
      {tieneRepuestos && (
        <div className={`rounded-2xl p-5 mb-4 border ${esCobrado ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {esCobrado ? '✓ Repuestos cobrados' : '⏳ Repuestos pendientes de cobro'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {esCobrado ? 'Esta visita ya fue procesada' : 'Esta visita aún no ha sido cobrada'}
              </p>
            </div>
            {!esCobrado ? (
              <button onClick={() => cambiarEstado('cobrado')}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
                Marcar cobrado
              </button>
            ) : (
              <button onClick={() => cambiarEstado('pendiente')}
                className="bg-white text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-200">
                Desmarcar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Eliminar */}
      <div className="flex justify-end pb-8">
        <button onClick={eliminarVisita}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1">
          🗑 Eliminar visita
        </button>
      </div>
    </div>
  )
}