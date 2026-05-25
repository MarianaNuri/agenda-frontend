// api.js — Puente central de comunicación entre la agenda y el servidor PHP
// Este archivo es el único punto por donde pasan TODAS las peticiones al backend
// (iniciar sesión, crear contacto, eliminar contacto, actualizar perfil, etc.).
// Cualquier función de la agenda que necesite hablar con el servidor lo hace a
// través de la función apiRequest que se define aquí.

import { getApiUrl } from '@/config/api'

/**
 * Realiza una petición HTTP al backend.
 *
 * @param {string}  endpoint  - Ruta relativa (ej: '/auth/login.php')
 * @param {Object}  options
 * @param {string}  [options.method='GET']    - Método HTTP
 * @param {Object|FormData|null} [options.body=null] - Cuerpo de la petición
 * @param {Object}  [options.headers={}]      - Headers adicionales
 * @param {boolean} [options.auth=true]       
 * @returns {Promise<Object>} Respuesta JSON del servidor
 * @throws {Object} { message, status, data }
 */

// Esta función es el "puente" entre el frontend y el backend PHP de la agenda.
// Cada vez que el usuario hace algo (login, ver contactos, subir foto, etc.),
// esta función se encarga de enviar la solicitud al servidor y devolver la respuesta.
export async function apiRequest(endpoint, {
  method = 'GET',
  body = null,
  headers = {},
  auth = true,
} = {}) {
  // Se construye la dirección completa del servidor a partir de la configuración
  const baseUrl = await getApiUrl()
  const url = `${baseUrl}${endpoint}`

  const finalHeaders = { ...headers }

  // Si la petición requiere autenticación, se adjunta automáticamente el token del usuario.
  // Así el servidor sabe quién está haciendo la solicitud sin que el usuario tenga que volver a ingresar sus datos.
  if (auth) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  // Configurar body
  const fetchOptions = {
    method,
    headers: finalHeaders,
  }

  // Aquí se decide cómo enviar los datos al servidor:
  // - Si el usuario sube una foto, se usa FormData (permite enviar archivos).
  // - Si solo se envían datos de texto (nombre, teléfono, etc.), se envían como JSON.
  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body
    } else {
      finalHeaders['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(body)
    }
  }

  try {
    // Se envía la petición al servidor y se espera su respuesta
    const response = await fetch(url, fetchOptions)

    // Intentar parsear JSON (algunos endpoints devuelven 204 sin body)
    // Se intenta leer la respuesta del servidor como datos JSON
    let data = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      // Fallback: intentar parsear como JSON aunque el header no lo indique,
      // ya que algunos backends no envían Content-Type correctamente.
      try {
        const text = await response.text()
        if (text && text.trim()) {
          data = JSON.parse(text)
        }
      } catch {
        // No es JSON válido, data queda null
      }
    }
    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      // Si el servidor responde con error 401, significa que el token del usuario
      // expiró o ya no es válido. En ese caso, se cierra la sesión automáticamente
      // y se redirige al usuario a la pantalla de login para que ingrese de nuevo.
      // Manejo especial para 401: token expirado o inválido
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        // Redirigir al login si no estamos ya ahí
        if (window.location.pathname !== `${import.meta.env.BASE_URL}login`) {
          window.location.href = `${import.meta.env.BASE_URL}login`
        }
      }

      const errorMessage = data?.message
        || data?.error
        || `Error del servidor (HTTP ${response.status})`

      throw {
        message: errorMessage,
        status: response.status,
        data,
      }
    }

    return data
  } catch (error) {
    // Si ya es nuestro error personalizado, re-lanzar
    if (error.status) {
      throw error
    }
    // Si hay un problema de conexión (no hay internet, el servidor no responde, etc.),
    // se le muestra un mensaje amigable al usuario en lugar de un error técnico.
    console.error('[api] Error de red:', error)
    throw {
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      status: 0,
      data: null,
    }
  }
}
