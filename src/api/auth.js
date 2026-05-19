/**
 * src/api/auth.js
 *
 * Servicios de autenticación: login, registro, obtener usuario, logout.
 * Todas las funciones usan el cliente HTTP centralizado (api.js).
 */

import { apiRequest } from '@/api/api'

/**
 * Iniciar sesión.
 * @param {string} nombre_de_usuario
 * @param {string} password
 * @returns {Promise<Object>} { token, user, message }
 */
export async function loginService(nombre_de_usuario, password) {
  const data = await apiRequest('/auth/login.php', {
    method: 'POST',
    body: { nombre_de_usuario, password }, 
    auth: false, 
  })
  return data
}

/**
 * Registrar nuevo usuario.
 * @param {string} nombre_de_usuario
 * @param {string} password
 * @returns {Promise<Object>} { token, user, message }
 */
export async function registerService(nombre_de_usuario, password) {
  const data = await apiRequest('/auth/registrar.php', {
    method: 'POST',
    body: { nombre_de_usuario, password }, 
    auth: false,
  })
  return data
}

/**
 * Obtener datos del usuario autenticado de forma dinámica.
 * @param {number|string} userId
 * @returns {Promise<Object>} { user }
 */
export async function getMeService(userId) {
  // 🔍 CORRECCIÓN: Le pasamos el ID por parámetro en la URL para evitar verificarToken()
  const data = await apiRequest(`/auth/perfil.php?usuario_id=${userId}`, {
    method: 'GET',
    auth: true,
  })
  return data
}

/**
 * Cerrar sesión en el servidor.
 * @param {number|string} userId
 * @returns {Promise<Object>}
 */
export async function logoutService(userId) {
  // 🔍 CORRECCIÓN: Le mandamos el ID por parámetro para limpiar la base de datos sin trabarse
  const data = await apiRequest(`/auth/logout.php?usuario_id=${userId}`, {
    method: 'POST',
    auth: true,
  })
  return data
}

/**
 * Actualizar perfil del usuario autenticado.
 */
export async function updateProfileService(profileData) {
  if (profileData.foto instanceof File) {
    const formData = new FormData()
    formData.append('nombre_de_usuario', profileData.nombre_de_usuario)
    formData.append('foto', profileData.foto)

    const data = await apiRequest('/auth/editar.php', {
      method: 'POST',
      body: formData,
      auth: true,
    })
    return data
  }

  const data = await apiRequest('/auth/editar.php', {
    method: 'POST',
    body: {
      nombre_de_usuario: profileData.nombre_de_usuario,
    },
    auth: true,
  })
  return data
}
