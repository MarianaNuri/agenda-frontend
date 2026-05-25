// api.js — Conexión con el servidor de la agenda
// Este archivo le indica a la aplicación DÓNDE se encuentra
// el servidor backend (PHP) que almacena los contactos y
// los datos de los usuarios. La dirección del servidor se
// lee del archivo config.json para no tenerla escrita
// directamente en el código.

// Guarda la dirección del servidor una vez que se lee, para no tener que leerla de nuevo
let cachedApiUrl = null

/**
Obtiene la URL base del API.
 * @returns {Promise<string>} URL base sin barra final
*/
// Esta función obtiene la dirección del servidor donde están guardados los contactos y usuarios
export async function getApiUrl() {
  // Si ya se leyó la dirección antes, se reutiliza sin volver a consultar el archivo
  if (cachedApiUrl) return cachedApiUrl

  try {
    // Se lee el archivo config.json que contiene la dirección del servidor de la agenda
    const response = await fetch('./config.json')
    if (!response.ok) {
      throw new Error(`No se pudo cargar config.json (HTTP ${response.status})`)
    }
    const config = await response.json()
    // Quitar barra final si la tiene
    cachedApiUrl = config.API_URL.replace(/\/+$/, '')
    return cachedApiUrl
  } catch (error) {
    // Si no se puede conectar con el servidor, se muestra el error en la consola
    console.error('[config/api] Error cargando configuración:', error)
    throw error
  }
}
