/**
 * src/config/api.js
 *
 * Carga la URL base del API desde /public/config.json.
 * Se cachea en memoria para no repetir la petición en cada llamada.
 */

let cachedApiUrl = null

/**
 * Obtiene la URL base del API.
 * La primera vez la lee desde /config.json; las siguientes la sirve desde caché.
 * @returns {Promise<string>} URL base sin barra final (ej: "https://equipo1.free.nf/api")
 */
export async function getApiUrl() {
  if (cachedApiUrl) return cachedApiUrl

  try {
    const response = await fetch('/config.json')
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
