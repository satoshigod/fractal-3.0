import { test } from 'node:test'
import assert from 'node:assert/strict'
import { puntosNoche, puntosAPesos } from '../../lib/dominio/puntos.js'
import { liquidacionOrigen } from '../../lib/dominio/origen.js'

test('puntos por noche', () => {
  assert.equal(puntosNoche(true), 1.68)
  assert.equal(puntosNoche(false), 1.00)
})
test('puntos a pesos', () => {
  assert.equal(puntosAPesos(2), 2_600_000)
})
test('liquidación Origen base', () => {
  assert.equal(liquidacionOrigen({ valor: 800_000_000, remodelacion: 50_000_000, deudas: 8_000_000 }), 690_000_000)
})
test('liquidación Origen conservando fracción', () => {
  assert.equal(liquidacionOrigen({ valor: 800_000_000, remodelacion: 50_000_000, deudas: 8_000_000, fraccionConservada: 125_000_000 }), 565_000_000)
})
