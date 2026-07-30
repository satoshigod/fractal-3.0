export const fmtCOP = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)
export const fecha = s => new Date(s + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
export const cap = s => (s || '').charAt(0).toUpperCase() + (s || '').slice(1).replace(/_/g, ' ')
export const ROL_LABEL = { admin:'Administrador', operador:'Operador', asesor:'Asesor', dueno:'Dueño', co_propietario:'Co-propietario', huesped:'Huésped' }
