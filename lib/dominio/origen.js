// Lógica pura de Origen (liquidación al propietario). Espeja fx_liquidacion_origen().

/**
 * Liquidación al dueño que incorpora una propiedad.
 * activo = valor + remodelación; menos remodelación, deudas, honorarios (fee del activo)
 * y el valor de la fracción que conserva.
 */
export function liquidacionOrigen({ valor, remodelacion = 0, deudas = 0, feePct = 0.12, fraccionConservada = 0 }) {
  const activo = (valor || 0) + (remodelacion || 0)
  return activo - remodelacion - deudas - activo * feePct - fraccionConservada
}
