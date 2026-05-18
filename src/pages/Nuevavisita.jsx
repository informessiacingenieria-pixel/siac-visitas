import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function NuevaVisita() {
  const navigate = useNavigate()
  const [tecnicos, setTecnicos] = useState([])
  const [centros, setCentros] = useState([])
  const [loading, setLoading] = useState(false)
  const [repuestos, setRepuestos] = useState([{ descripcion: '', cantidad: 1 }])

  const [form, setForm] = useState({
    numero_visita: '',
    fecha: new Date().toISOString().split('T')[0],
    centro_id: '',
    tecnico_id: '',
    observaciones: '',
    oc: '',
    orden_servicio: '',
    solicitado_por: '',
    nombre_receptor: '',
    cargo_receptor: '',
  })

  useEffect(() => {
    supabase.from('tecnicos').select('id, nombre').order('nombre').then(({ data }) => setTecnicos(data || []))
    supabase.from('centros').select('id, nombre').order('nombre').then(({ data }) => setCentros(data || []))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRepuestoChange = (index, field, value) => {
    const updated = [...repuestos]
    updated[index][field] = value
    setRepuestos(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: visita, error } = await supabase
      .from('visitas')
      .insert([{ ...form, centro_id: form.centro_id || null, tecnico_id: form.tecnico_id || null }])
      .select().single()

    if (error) { alert('Error: ' + error.message); setLoading(false); return }

    const repuestosValidos = repuestos.filter(r => r.descripcion.trim() !== '')
    if (repuestosValidos.length > 0) {
      await supabase.from('repuestos_visita').insert(
        repuestosValidos.map(r => ({ ...r, visita_id: visita.id }))
      )
    }
    navigate('/visitas')
  }

  const inputClass = "mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wide"

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/visitas')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1 transition-colors">
          ← Volver a visitas
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva visita</h1>
        <p className="text-gray-400 text-sm mt-1">Completa los datos del informe de servicio técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Info general */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">1</span>
            Información general
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fecha</label>
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                  className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>N° Visita</label>
                <input name="numero_visita" value={form.numero_visita} onChange={handleChange}
                  className={inputClass} placeholder="Ej: 011461" required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cliente / Centro</label>
              <select name="centro_id" value={form.centro_id} onChange={handleChange} className={inputClass}>
                <option value="">Selecciona un centro</option>
                {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Técnico</label>
              <select name="tecnico_id" value={form.tecnico_id} onChange={handleChange} className={inputClass} required>
                <option value="">Selecciona un técnico</option>
                {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">2</span>
            Observaciones
          </h2>
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange}
            rows={4}
            className={inputClass + ' resize-none'}
            placeholder="Describe el trabajo realizado, problema encontrado y solución aplicada..." />
        </div>

        {/* Repuestos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">3</span>
            Repuestos utilizados
          </h2>
          <div className="flex flex-col gap-3">
            {repuestos.map((r, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  value={r.descripcion}
                  onChange={e => handleRepuestoChange(i, 'descripcion', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="Ej: Bujes reducción ablandador B" />
                <input
                  type="number" min="1"
                  value={r.cantidad}
                  onChange={e => handleRepuestoChange(i, 'cantidad', parseInt(e.target.value))}
                  className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all text-center"
                  placeholder="Cant." />
                {repuestos.length > 1 && (
                  <button type="button"
                    onClick={() => setRepuestos(repuestos.filter((_, idx) => idx !== i))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-lg font-bold">
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button"
              onClick={() => setRepuestos([...repuestos, { descripcion: '', cantidad: 1 }])}
              className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-1 w-fit">
              + Agregar repuesto
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end pb-8">
          <button type="button" onClick={() => navigate('/visitas')}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-200">
            {loading ? 'Guardando...' : 'Guardar visita'}
          </button>
        </div>
      </form>
    </div>
  )
}