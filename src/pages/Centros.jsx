import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Centros() {
  const [centros, setCentros] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('centros').select('*').order('nombre')
      .then(({ data }) => {
        setCentros(data || [])
        setLoading(false)
      })
  }, [])

  const centrosFiltrados = centros.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Centros</h1>
        <p className="text-gray-500 text-sm mt-1">{centros.length} centros registrados</p>
      </div>

      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar centro..."
        className="mb-4 w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {centrosFiltrados.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-700 font-medium">{c.nombre}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}