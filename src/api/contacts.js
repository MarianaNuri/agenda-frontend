/**
 * src/api/contacts.js
 *
 * Servicios CRUD de contactos.
 * Todas las funciones usan el cliente HTTP centralizado (api.js).
 */

import { apiRequest } from '@/api/api'

/**
 * Obtener todos los contactos del usuario autenticado de forma dinámica.
 * @param {number|string} userId
 * @returns {Promise<Array>} Lista de contactos
 */
export async function getContactsService(userId) {
  // Pasamos el usuario_id en la URL para evitar bloqueos del Token
  const data = await apiRequest(`/contactos/index.php?usuario_id=${userId}`, {
    method: 'GET',
    auth: true,
  })
  
  // Como el backend modificado ya devuelve el array directo, mandamos 'data' entero.
  // Si por alguna razón tu apiRequest lo vuelve a envolver, dejamos el respaldo data.data
  return Array.isArray(data) ? data : (data?.data || data || [])
}

/**
 * Obtener un contacto por su ID.
 * @param {number|string} id
 * @returns {Promise<Object>} Datos del contacto
 */
export async function getContactByIdService(id) {
  const data = await apiRequest(`/contactos/detalle.php?id=${id}`, {
    method: 'GET',
    auth: true,
  })
  return data?.data || data || null
}

/**
 * Crear un nuevo contacto asignado a un usuario específico.
 * @param {Object} contactData - { nombre, telefono, email, direccion, notas, foto? }
 * @param {number|string} userId
 * @returns {Promise<Object>} Contacto creado
 */
export async function createContactService(contactData, userId) {
  const formData = new FormData()
  formData.append('nombre', contactData.nombre || '')
  formData.append('telefono', contactData.telefono || '')
  formData.append('email', contactData.email || '')
  formData.append('direccion', contactData.direccion || '')
  formData.append('notas', contactData.notas || '')

  if (contactData.foto instanceof File) {
    formData.append('foto', contactData.foto)
  }

  // Pasamos el usuario_id también en la URL de creación
  const data = await apiRequest(`/contactos/crear.php?usuario_id=${userId}`, {
    method: 'POST',
    body: formData,
    auth: true,
  })
  return data
}

/**
 * Actualizar un contacto existente de forma dinámica.
 * @param {number|string} id - ID del contacto
 * @param {Object} contactData - Datos del formulario
 * @param {number|string} userId - ID del usuario logueado NUEVO PARÁMETRO
 */
export async function updateContactService(id, contactData, userId) {
  const formData = new FormData()
  formData.append('id', id) // Mandamos el ID del contacto en el cuerpo
  formData.append('nombre', contactData.nombre || '')
  formData.append('telefono', contactData.telefono || '')
  formData.append('email', contactData.email || '')
  formData.append('direccion', contactData.direccion || '')
  formData.append('notas', contactData.notas || '')

  if (contactData.foto instanceof File) {
    formData.append('foto', contactData.foto)
  }

  // PASAMOS EL USUARIO_ID EN LA URL
  const data = await apiRequest(`/contactos/actualizar.php?usuario_id=${userId}`, {
    method: 'POST',
    body: formData,
    auth: true,
  })
  return data
}


/**
 * Eliminar un contacto asignado al usuario.
 * @param {number|string} id - ID del contacto a borrar
 * @param {number|string} userId - ID del usuario logueado 🔍 NUEVO PARÁMETRO
 */
export async function deleteContactService(id, userId) {
  //CONCATENAMOS EL USUARIO_ID EN LA URL JUNTO AL ID DEL CONTACTO :P
  const data = await apiRequest(`/contactos/eliminar.php?id=${id}&usuario_id=${userId}`, {
    method: 'DELETE',
    auth: true,
  })
  return data
}
