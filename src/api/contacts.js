// contacts.js — Funciones para administrar los contactos de la agenda
// Este archivo contiene todas las operaciones de la agenda de contactos:
// ver todos los contactos, ver el detalle de uno, crear, editar y eliminar.
// Todas las funciones envían el usuario_id para que el servidor solo devuelva
// o modifique los contactos que pertenecen al usuario que tiene sesión abierta.

import { apiRequest } from '@/api/api'

/**
 * Obtener todos los contactos del usuario autenticado de forma dinámica.
 * @param {number|string} userId
 * @returns {Promise<Array>} Lista de contactos
 */
// Esta función obtiene del servidor la lista completa de contactos del usuario.
// Se usa para mostrar todos los contactos en la pantalla principal de la agenda.
export async function getContactsService(userId) {
  // Pasamos el usuario_id en la URL para evitar bloqueos del Token
  const data = await apiRequest(`/contactos/index.php?usuario_id=${userId}`, {
    method: 'GET',
    auth: true,
  })
  
  // Se asegura de devolver siempre un arreglo de contactos,
  // sin importar el formato en que el servidor responda.
  // Como el backend modificado ya devuelve el array directo, mandamos 'data' entero.
  // Si por alguna razón tu apiRequest lo vuelve a envolver, dejamos el respaldo data.data
  return Array.isArray(data) ? data : (data?.data || data || [])
}

/**
 * Obtener un contacto por su ID de manera dinámica.
 * @param {number|string} id - ID del contacto
 * @param {number|string} userId - ID del usuario activo
 * @returns {Promise<Object>} Datos del contacto
 */
// Esta función obtiene los datos de un solo contacto para mostrarlo
// en el formulario de edición. Se envían ambos IDs para seguridad.
export async function getContactByIdService(id, userId) {
  //PASAMOS AMBOS PARÁMETROS EN LA URL
  const data = await apiRequest(`/contactos/detalle.php?id=${id}&usuario_id=${userId}`, {
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
// Esta función envía los datos de un nuevo contacto al servidor para guardarlo.
// Se usa FormData porque el usuario puede incluir una foto del contacto.
export async function createContactService(contactData, userId) {
  // Se preparan todos los campos del contacto como datos de formulario
  const formData = new FormData()
  formData.append('nombre', contactData.nombre || '')
  formData.append('apellido', contactData.apellido || '')
  formData.append('telefono', contactData.telefono || '')
  formData.append('email', contactData.email || '')
  formData.append('direccion', contactData.direccion || '')
  formData.append('notas', contactData.notas || '')

  // Si el usuario seleccionó una foto para el contacto, se adjunta al envío
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
// Esta función envía al servidor los datos modificados de un contacto existente.
// Se usa cuando el usuario edita un contacto desde el formulario de edición.
export async function updateContactService(id, contactData, userId) {
  // Se preparan los campos actualizados del contacto como datos de formulario
  const formData = new FormData()
  formData.append('id', id) // Mandamos el ID del contacto en el cuerpo
  formData.append('nombre', contactData.nombre || '')
  formData.append('apellido', contactData.apellido || '')
  formData.append('telefono', contactData.telefono || '')
  formData.append('email', contactData.email || '')
  formData.append('direccion', contactData.direccion || '')
  formData.append('notas', contactData.notas || '')

  // Si el usuario cambió la foto del contacto, se adjunta la nueva imagen
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
 * Eliminar un contacto asignado al usuario (Cumpliendo método POST de la rúbrica).
 * @param {number|string} id - ID del contacto a borrar
 * @param {number|string} userId - ID del usuario logueado
 */
// Esta función le indica al servidor que elimine permanentemente un contacto.
// Se envía el ID del contacto a borrar y el usuario_id para verificar que le pertenece.
export async function deleteContactService(id, userId) {
  // Se envía el ID del contacto que el usuario quiere eliminar
  const formData = new FormData()
  formData.append('id', id) // Enviamos el ID del contacto en el cuerpo de la petición

  // Enviamos mediante POST y pasamos el usuario_id en la URL
  const data = await apiRequest(`/contactos/eliminar.php?usuario_id=${userId}`, {
    method: 'POST',
    body: formData,
    auth: true,
  })
  return data
}