// lib/segmentosRoles.js
// Mapa de roles → segmentos → tareas de Fractal.
// Cada segmento es un bloque de trabajo/funcionalidad que un rol realiza en la plataforma.
// Mismo patrón que ESCALA (roles → segmentos → tareas), con el contenido de Fractal.

export const SEGMENTOS_ROLES = {
  'Dueño (Origen)': {
    'Incorporación': [
      { nombre: 'Cotizar la propiedad', descripcion: 'Usar el cotizador de Origen para ver la liquidación estimada según valor, remodelación y deudas.', categoria: 'Origen' },
      { nombre: 'Visita técnica del arquitecto', descripcion: 'Diagnóstico y presupuesto de remodelación por el Arquitecto Fractal.', categoria: 'Origen' },
      { nombre: 'Saneamiento', descripcion: 'Fractal asume deudas de administración/servicios y negocia embargos para desbloquear la propiedad.', categoria: 'Legal' },
      { nombre: 'Remodelación', descripcion: 'Financiada por Fractal y descontada de la venta, no del bolsillo del dueño.', categoria: 'Operación' },
      { nombre: 'Escritura de la fracción conservada', descripcion: 'El dueño conserva 1/8 escriturado a su nombre.', categoria: 'Legal' },
    ],
    'Curva de desapego': [
      { nombre: 'Definir cuántas fracciones vender (1–7)', descripcion: 'El dueño controla cuánto vende y cuándo parar.', categoria: 'Origen' },
      { nombre: 'Recibir la liquidación', descripcion: 'Bolsa − remodelación − deudas − 12% honorarios − fracción conservada.', categoria: 'Financiero' },
      { nombre: 'Usar los días de su fracción', descripcion: 'Como cualquier co-propietario sobre su 1/8, con sus costos y calendario.', categoria: 'Uso' },
    ],
  },
  'Co-propietario': {
    'Compra de fracción': [
      { nombre: 'Cotizar y elegir slot', descripcion: 'A/B (weekend, 15.65%) o Weekday (9.35%), según uso y presupuesto.', categoria: 'Destino' },
      { nombre: 'Pagar y escriturar', descripcion: 'Formalizar la copropiedad de la fracción.', categoria: 'Legal' },
    ],
    'Uso del calendario': [
      { nombre: 'Ver días asignados por slot', descripcion: 'El calendario semestral asigna sus días.', categoria: 'Calendario' },
      { nombre: 'Reservar días', descripcion: 'Con anticipación, gastando puntos (1.68 FDS / 1.00 entre semana).', categoria: 'Calendario' },
      { nombre: 'Ceder días al operador', descripcion: 'Días que no usará; el operador los renta y le genera ingreso.', categoria: 'Calendario' },
    ],
    'Puntos e intercambio': [
      { nombre: 'Intercambiar A ↔ B / WD ↔ WD', descripcion: 'Mercado interno de días; diferencia en puntos/efectivo.', categoria: 'Mercado' },
      { nombre: 'Exchange entre productos', descripcion: 'Usar puntos entre fincas, autos y náutico.', categoria: 'Mercado' },
    ],
    'Ingresos y reventa': [
      { nombre: 'Recibir renta de días cedidos', descripcion: 'Ingreso proporcional (el operador cobra comisión).', categoria: 'Financiero' },
      { nombre: 'Revender la fracción', descripcion: 'Listar en el mercado secundario; nuevos miembros aprobados por la comunidad.', categoria: 'Mercado' },
    ],
  },
  'Operador': {
    'Gestión (23 ítems)': [
      { nombre: 'Operar la propiedad', descripcion: 'Mayordomo, servicios, limpieza, mantenimiento, seguros, amenidades.', categoria: 'Operación' },
      { nombre: 'Controlar costos', descripcion: 'Los 23 ítems repartidos entre los 8 según el tipo de uso.', categoria: 'Financiero' },
    ],
    'Renta de días cedidos': [
      { nombre: 'Publicar en OTAs', descripcion: 'Airbnb/Booking + PMS para los días cedidos.', categoria: 'Renta' },
      { nombre: 'Recibir huéspedes', descripcion: 'Gestionar la estadía y cobrar.', categoria: 'Renta' },
      { nombre: 'Repartir el ingreso', descripcion: 'Al co-propietario dueño del día, menos comisión (~15%).', categoria: 'Financiero' },
    ],
    'Reportes': [
      { nombre: 'Ocupación e ingresos', descripcion: 'Por activo y por co-propietario.', categoria: 'Reportes' },
    ],
  },
  'Asesor / Arquitecto': {
    'Comercial': [
      { nombre: 'Atender leads', descripcion: 'Solicitudes del sitio, por perfil y producto.', categoria: 'Comercial' },
      { nombre: 'Cotizar y cerrar', descripcion: 'Guiar la compra o la incorporación (Origen).', categoria: 'Comercial' },
    ],
    'Visita técnica (Origen)': [
      { nombre: 'Diagnóstico', descripcion: 'Estado de la propiedad y viabilidad.', categoria: 'Origen' },
      { nombre: 'Presupuesto de remodelación', descripcion: 'Base de la cotización de liquidación.', categoria: 'Origen' },
    ],
  },
  'Administrador': {
    'Activos y fracciones': [
      { nombre: 'Crear y gestionar activos', descripcion: 'Fincas, náutico, autos, híbridos con sus fracciones.', categoria: 'Admin' },
    ],
    'Usuarios y roles': [
      { nombre: 'Gestionar usuarios y asignar roles', descripcion: 'La fuente de verdad del rol es perfiles.rol.', categoria: 'Admin' },
    ],
    'Aprobaciones': [
      { nombre: 'KYC y escrituras', descripcion: 'Verificar identidad y documentos.', categoria: 'Confianza' },
      { nombre: 'Aprobación de comunidad', descripcion: 'Curar los nuevos miembros de cada propiedad (8 familias).', categoria: 'Confianza' },
    ],
    'Cumplimiento': [
      { nombre: 'RNT y contratos', descripcion: 'Registro nacional de turismo y firma de contratos.', categoria: 'Legal' },
    ],
  },
  'Huésped': {
    'Estadía': [
      { nombre: 'Buscar destino disponible', descripcion: 'Explorar los destinos Fractal.', categoria: 'Uso' },
      { nombre: 'Reservar días cedidos', descripcion: 'Alquilar una estadía corta (sin propiedad).', categoria: 'Renta' },
    ],
  },
}
