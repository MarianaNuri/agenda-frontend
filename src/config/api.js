/**
 * src/config/api.js
 *
 * Carga la URL base del API desde /config.json de forma relativa.
 * Se cachea en memoria para no repetir la petición en cada llamada.
 */

let cachedApiUrl = null

/**
 * Obtiene la URL base del API.
 * @returns {Promise<string>} URL base sin barra final
 */
export async function getApiUrl() {
  if (cachedApiUrl) return cachedApiUrl

  try {
    // Cambiado a './config.json' para que funcione en cualquier entorno
    const response = await fetch('./config.json')
    if (!response.ok) {
      throw new Error(`No se pudo cargar config.json (HTTP ${response.status})`)
    }
    const config = await response.json()
    // Quitar barra final si la tiene
    cachedApiUrl = config.API_URL.replace(/\/+$/, '')
    return cachedApiUrl
  } catch (error) {
    console.error('[config/api] Error cargando configuración:', error)
    throw error
  }
}
