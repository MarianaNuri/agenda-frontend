/**
 * src/api/contacts.js
 *
 * Servicios CRUD de contactos.
 * Todas las funciones usan el cliente HTTP centralizado (api.js).
 */

import { apiRequest } from '@/api/api'

/**
 * Obtener todos los contactos del usuario autenticado.
 * @returns {Promise<Array>} Lista de contactos
 */
export async function getContactsService() {
  const data = await apiRequest('/contactos/index.php', {
    method: 'GET',
    auth: true,
  })
  // El backend puede devolver { contacts: [...] } o directamente un array
  return data?.contacts || data || []
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
  return data?.contact || data
}

/**
 * Crear un nuevo contacto.
 * @param {Object} contactData - { nombre, telefono, email, direccion, notas, foto? }
 * @returns {Promise<Object>} Contacto creado
 */
export async function createContactService(contactData) {
  const formData = new FormData()
  formData.append('nombre', contactData.nombre || '')
  formData.append('telefono', contactData.telefono || '')
  formData.append('email', contactData.email || '')
  formData.append('direccion', contactData.direccion || '')
  formData.append('notas', contactData.notas || '')

  if (contactData.foto instanceof File) {
    formData.append('foto', contactData.foto)
  }

  const data = await apiRequest('/contactos/crear.php', {
    method: 'POST',
    body: formData,
    auth: true,
  })
  return data
}

/**
 * Actualizar un contacto existente.
 * @param {number|string} id
 * @param {Object} contactData - { nombre, telefono, email, direccion, notas, foto? }
 * @returns {Promise<Object>} Contacto actualizado
 */
export async function updateContactService(id, contactData) {
  const formData = new FormData()
  formData.append('nombre', contactData.nombre || '')
  formData.append('telefono', contactData.telefono || '')
  formData.append('email', contactData.email || '')
  formData.append('direccion', contactData.direccion || '')
  formData.append('notas', contactData.notas || '')

  if (contactData.foto instanceof File) {
    formData.append('foto', contactData.foto)
  }

  const data = await apiRequest(`/contactos/actualizar.php?id=${id}`, {
    method: 'POST',
    body: formData,
    auth: true,
  })
  return data
}

/**
 * Eliminar un contacto.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function deleteContactService(id) {
  const data = await apiRequest(`/contactos/eliminar.php?id=${id}`, {
    method: 'DELETE',
    auth: true,
  })
  return data
}
