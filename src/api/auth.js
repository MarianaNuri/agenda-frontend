// auth.js — Servicios de autenticación de la agenda de contactos
// Este archivo contiene todas las funciones que se comunican con el servidor PHP
// para manejar la sesión del usuario: iniciar sesión, registrarse, ver el perfil,
// cerrar sesión y actualizar los datos del perfil (nombre y foto).
// Todas las funciones usan el puente central (api.js) para hablar con el backend.

import { apiRequest } from '@/api/api'

/**
 * Iniciar sesión.
 * @param {string} nombre_de_usuario
 * @param {string} password
 * @returns {Promise<Object>} { token, user, message }
 */
// Esta función envía el nombre de usuario y la contraseña al servidor
// para que el usuario pueda iniciar sesión en su agenda de contactos.
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
// Esta función envía los datos al servidor para crear una nueva cuenta de usuario.
// Una vez registrado, el usuario podrá acceder a su propia agenda de contactos.
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
// Esta función consulta al servidor la información del perfil del usuario
// (nombre, foto, etc.). Se pasa el userId en la URL para que el backend sepa qué usuario buscar.
export async function getMeService(userId) {
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
// Esta función le indica al servidor que el usuario quiere cerrar sesión.
// El servidor invalida el token para que ya no pueda usarse la sesión anterior.
export async function logoutService(userId) {
  //Le mandamos el ID por parámetro para limpiar la base de datos sin trabarse
  const data = await apiRequest(`/auth/logout.php?usuario_id=${userId}`, {
    method: 'POST',
    auth: true,
  })
  return data
}

// Esta función permite al usuario actualizar su perfil (cambiar su nombre y/o foto).
// Si el usuario sube una foto nueva, se envía con FormData para que el servidor la reciba como archivo.
export async function updateProfileService(profileData, userId) {
  // Si el usuario seleccionó una foto nueva, se preparan los datos como formulario
  // para poder enviar el archivo de imagen junto con el nombre de usuario.
  if (profileData.foto instanceof File) {
    const formData = new FormData()
    formData.append('nombre_de_usuario', profileData.nombre_de_usuario)
    formData.append('foto', profileData.foto)

    // 
    const data = await apiRequest(`/auth/editar.php?id=${userId}`, {
      method: 'POST',
      body: formData,
      auth: true,
    })
    return data
  }

  // Si el usuario solo cambia el nombre (sin foto nueva), se envían los datos como JSON
  //  También añadimos ?id= aquí para cuando solo se cambia el nombre
  const data = await apiRequest(`/auth/editar.php?id=${userId}`, {
    method: 'POST',
    body: {
      nombre_de_usuario: profileData.nombre_de_usuario,
    },
    auth: true,
  })
  return data
}

