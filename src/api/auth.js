/**
 * src/api/auth.js
 *
 * Servicios de autenticación: login, registro, obtener usuario, logout.
 * Todas las funciones usan el cliente HTTP centralizado (api.js).
 */

import { apiRequest } from '@/api/api'

/**
 * Iniciar sesión.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} { token, user, message }
 */
export async function loginService(email, password) {
  const data = await apiRequest('/auth/login.php', {
    method: 'POST',
    body: { email, password },
    auth: false, // No necesita token para login
  })
  return data
}

/**
 * Registrar nuevo usuario.
 * @param {string} nombre
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} { token, user, message }
 */
export async function registerService(nombre, email, password) {
  const data = await apiRequest('/auth/registrar.php', {
    method: 'POST',
    body: { nombre, email, password },
    auth: false,
  })
  return data
}

/**
 * Obtener datos del usuario autenticado.
 * @returns {Promise<Object>} { user }
 */
export async function getMeService() {
  const data = await apiRequest('/auth/perfil.php', {
    method: 'GET',
    auth: true,
  })
  return data
}

/**
 * Cerrar sesión en el servidor.
 * @returns {Promise<Object>}
 */
export async function logoutService() {
  const data = await apiRequest('/auth/logout.php', {
    method: 'POST',
    auth: true,
  })
  return data
}

/**
 * Actualizar perfil del usuario autenticado.
 * @param {Object} profileData - { nombre, email, foto? }
 * @returns {Promise<Object>}
 */
export async function updateProfileService(profileData) {
  // Si hay foto, usar FormData
  if (profileData.foto instanceof File) {
    const formData = new FormData()
    formData.append('nombre', profileData.nombre)
    formData.append('email', profileData.email)
    formData.append('foto', profileData.foto)

    const data = await apiRequest('/auth/editar.php', {
      method: 'POST',
      body: formData,
      auth: true,
    })
    return data
  }

  // Sin foto, enviar JSON
  const data = await apiRequest('/auth/editar.php', {
    method: 'POST',
    body: {
      nombre: profileData.nombre,
      email: profileData.email,
    },
    auth: true,
  })
  return data
}
