// Servicio para consumir la API de Machine Learning (predicciones y segmentación)
// En desarrollo usa el proxy de Vite (/api/ml), en producción usa VITE_ML_API_URL directamente.

const BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_ML_API_URL
  : '/api/ml';

/**
 * Predice probabilidades de victoria entre dos equipos.
 * @param {string} homeTeam - Nombre o código del equipo local (ej: "México", "ECU")
 * @param {string} awayTeam - Nombre o código del equipo visitante (ej: "RSA", "Alemania")
 * @returns {Promise<Object>} Respuesta con probabilidades y gamificación
 */
export async function predictMatch(homeTeam, awayTeam) {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      home_team: homeTeam,
      away_team: awayTeam,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Error ${response.status} al predecir partido`);
  }

  return response.json();
}

/**
 * Predice el segmento financiero de un cliente.
 * @param {Object} financialData - Datos financieros del cliente
 * @param {number} financialData.saldo_por_vencer
 * @param {number} financialData.saldo_vencido
 * @param {number} financialData.saldo_no_devenga
 * @param {number} financialData.cartera_total
 * @param {number} financialData.cartera_en_riesgo
 * @param {number} financialData.saldo_mora
 * @param {number} financialData.dias_mora
 * @returns {Promise<Object>} Respuesta con segmento asignado y cluster_id
 */
export async function predictSegmento(financialData) {
  const response = await fetch(`${BASE_URL}/predict_segmento`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(financialData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Error ${response.status} al segmentar cliente`);
  }

  return response.json();
}
