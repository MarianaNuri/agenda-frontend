import { getApiUrl } from '@/config/api'

/**
 * Realiza una petición HTTP al backend.
 *
 * @param {string}  endpoint  - Ruta relativa (ej: '/auth/login.php')
 * @param {Object}  options
 * @param {string}  [options.method='GET']    - Método HTTP
 * @param {Object|FormData|null} [options.body=null] - Cuerpo de la petición
 * @param {Object}  [options.headers={}]      - Headers adicionales
 * @param {boolean} [options.auth=true]       - Si debe enviar el token JWT
 * @returns {Promise<Object>} Respuesta JSON del servidor
 * @throws {Object} { message, status, data }
 */
export async function apiRequest(endpoint, {
  method = 'GET',
  body = null,
  headers = {},
  auth = true,
} = {}) {
  const baseUrl = await getApiUrl()
  const url = `${baseUrl}${endpoint}`

  
  const finalHeaders = { ...headers }

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

  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body
    } else {
      finalHeaders['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(body)
    }
  }

  try {
    const response = await fetch(url, fetchOptions)

    // Intentar parsear JSON (algunos endpoints devuelven 204 sin body)
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
    // Error de red / fetch
    console.error('[api] Error de red:', error)
    throw {
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      status: 0,
      data: null,
    }
  }
}
