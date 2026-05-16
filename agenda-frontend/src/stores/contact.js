/**
 * src/stores/contact.js
 *
 * Store Pinia de contactos.
 * Reemplaza los datos demo por consumo real del backend via API REST.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getContactsService,
  getContactByIdService,
  createContactService,
  updateContactService,
  deleteContactService,
} from '@/api/contacts'
import { getApiUrl } from '@/config/api'

export const useContactStore = defineStore('contacts', () => {
  /* ---------- State ---------- */
  const contacts = ref([])
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  /* ---------- Getters ---------- */
  const filteredContacts = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return contacts.value
    return contacts.value.filter(
      (c) =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.telefono || '').includes(q)
    )
  })

  const totalContacts = computed(() => contacts.value.length)

  /* ---------- Helpers privados ---------- */

  /** Limpia mensajes después de un tiempo */
  function _autoClearMessages(delayMs = 5000) {
    setTimeout(() => {
      error.value = ''
      successMessage.value = ''
    }, delayMs)
  }

  /* ---------- Actions ---------- */

  /**
   * Carga todos los contactos del backend.
   */
  async function fetchContacts() {
    loading.value = true
    error.value = ''

    try {
      const data = await getContactsService()
      contacts.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.message || 'Error al cargar los contactos.'
      _autoClearMessages()
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un contacto por ID.
   * Primero busca en el state local; si no lo encuentra, lo pide al backend.
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async function getById(id) {
    const numId = Number(id)
    // Buscar primero en caché local
    const local = contacts.value.find((c) => Number(c.id) === numId)
    if (local) return local

    // Si no está en caché, pedirlo al backend
    try {
      const contact = await getContactByIdService(id)
      return contact
    } catch (err) {
      error.value = err.message || 'Contacto no encontrado.'
      _autoClearMessages()
      return null
    }
  }

  /**
   * Crea un nuevo contacto.
   * @param {Object} data - { nombre, telefono, email, direccion, notas, foto? }
   * @returns {Promise<boolean>}
   */
  async function addContact(data) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      const result = await createContactService(data)
      // Agregar el contacto creado al state local
      const newContact = result.contact || result
      contacts.value.push(newContact)
      successMessage.value = result.message || 'Contacto creado correctamente.'
      _autoClearMessages()
      return true
    } catch (err) {
      error.value = err.message || 'Error al crear el contacto.'
      _autoClearMessages()
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un contacto existente.
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<boolean>}
   */
  async function updateContact(id, data) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      const result = await updateContactService(id, data)
      // Actualizar en el state local
      const updatedContact = result.contact || { ...data, id: Number(id) }
      const idx = contacts.value.findIndex((c) => Number(c.id) === Number(id))
      if (idx !== -1) {
        contacts.value[idx] = { ...contacts.value[idx], ...updatedContact }
      }
      successMessage.value = result.message || 'Contacto actualizado correctamente.'
      _autoClearMessages()
      return true
    } catch (err) {
      error.value = err.message || 'Error al actualizar el contacto.'
      _autoClearMessages()
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un contacto.
   * @param {number|string} id
   * @returns {Promise<boolean>}
   */
  async function deleteContact(id) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      const result = await deleteContactService(id)
      // Remover del state local
      contacts.value = contacts.value.filter((c) => Number(c.id) !== Number(id))
      successMessage.value = result?.message || 'Contacto eliminado correctamente.'
      _autoClearMessages()
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar el contacto.'
      _autoClearMessages()
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Establece el query de búsqueda.
   * @param {string} query
   */
  function setSearch(query) {
    searchQuery.value = query
  }

  /**
   * Construye la URL completa para la foto de un contacto.
   * @param {string} relativePath
   * @returns {Promise<string>}
   */
  async function buildPhotoUrl(relativePath) {
    if (!relativePath) return ''
    if (relativePath.startsWith('http')) return relativePath
    const base = await getApiUrl()
    return `${base}/${relativePath.replace(/^\/+/, '')}`
  }

  return {
    // State
    contacts,
    searchQuery,
    loading,
    error,
    successMessage,
    // Getters
    filteredContacts,
    totalContacts,
    // Actions
    fetchContacts,
    getById,
    addContact,
    updateContact,
    deleteContact,
    setSearch,
    buildPhotoUrl,
  }
})
