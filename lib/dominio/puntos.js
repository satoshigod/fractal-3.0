// Lógica pura de puntos. Sin acceso a datos: solo depende de sus entradas.
// Espeja fx_puntos_noche() de la base. Testeable sin Supabase.

/** Puntos que cuesta una noche: FDS/especial = 1.68, entre semana = 1.00. */
export function puntosNoche(esWeekend) {
  return esWeekend ? 1.68 : 1.00
}

/** Valor en pesos de un punto. */
export const VALOR_PUNTO_COP = 1_300_000

/** Puntos → pesos. */
export function puntosAPesos(puntos) {
  return (puntos || 0) * VALOR_PUNTO_COP
}
