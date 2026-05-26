// Este archivo es el almacén (store) de contactos de la agenda.
// Se encarga de cargar, crear, editar, eliminar y buscar los contactos
// del usuario. Es el corazón de la funcionalidad principal de la agenda.

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
  // Lista completa de contactos del usuario que ha iniciado sesión
  const contacts = ref([])
  // Texto que el usuario escribe en la barra de búsqueda para filtrar sus contactos
  const searchQuery = ref('')
  // Indica si se está procesando alguna operación (para mostrar un indicador de carga en la interfaz)
  const loading = ref(false)
  // Mensaje de error que se muestra al usuario cuando algo falla
  const error = ref('')
  // Mensaje de éxito que se muestra al usuario cuando una operación se completa correctamente
  const successMessage = ref('')
  // URL base del servidor para construir las rutas de las fotos de contactos
  const photoBaseUrl = ref('')

  /* ---------- Getters ---------- */
  // Filtra la lista de contactos en tiempo real mientras el usuario escribe en la barra de búsqueda (busca por nombre, correo o teléfono)
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

  // Muestra el número total de contactos que tiene el usuario en su agenda
  const totalContacts = computed(() => contacts.value.length)

  /* ---------- Helpers privados ---------- */

  // Hace que los mensajes de éxito o error desaparezcan automáticamente después de 5 segundos
  /** Limpia mensajes después de un tiempo */
  function _autoClearMessages(delayMs = 5000) {
    setTimeout(() => {
      error.value = ''
      successMessage.value = ''
    }, delayMs)
  }

  /* ---------- Actions ---------- */

  // Carga todos los contactos del usuario desde el servidor cuando abre la agenda
  async function fetchContacts() {
    loading.value = true
    error.value = ''

    try {
      // Cargamos la URL base del servidor para las fotos si aún no se tiene
      if (!photoBaseUrl.value) {
        try {
          photoBaseUrl.value = await getApiUrl()
        } catch {
          photoBaseUrl.value = ''
        }
      }

      // Extraemos el ID del usuario desde la sesión local
      const session = JSON.parse(localStorage.getItem('auth_user') || '{}')
      const userId = session.id || session.id_usuario || 1

      // Se piden al servidor solo los contactos que pertenecen a este usuario
      const data = await getContactsService(userId)
      contacts.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.message || 'Error al cargar los contactos.'
      _autoClearMessages()
    } finally {
      loading.value = false
    }
  }


  // Busca un contacto específico por su identificador; primero revisa si ya lo tiene en memoria, y si no, lo pide al servidor
  async function getById(id) {
    const numId = Number(id)
    // Buscar primero en caché local (si ya existe en la tabla, no hace petición a la BD)
    const local = contacts.value.find((c) => Number(c.id) === numId)
    if (local) return local

    // Si no está en la tabla local, ir a traerlo del backend
    try {
      // EXTRAEMOS EL ID DEL USUARIO DESDE LA CLAVE CORRECTA
      const session = JSON.parse(localStorage.getItem('auth_user') || '{}')
      const userId = session.id || session.id_usuario || 1

      //  LE PASAMOS EL ID AL SERVICIO
      const contact = await getContactByIdService(id, userId)
      return contact
    } catch (err) {
      error.value = err.message || 'Contacto no encontrado.'
      _autoClearMessages()
      return null
    }
  }

  // Envía los datos de un nuevo contacto al servidor y lo agrega a la lista local para que aparezca de inmediato
  /**
   * Crea un nuevo contacto asignado al usuario actual.
   * @param {Object} data - { nombre, telefono, email, direccion, notas, foto? }
   * @returns {Promise<boolean>}
   */
  async function addContact(data) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      // Extraemos el ID del usuario actual para mandarlo al crear.php
      const session = JSON.parse(localStorage.getItem('auth_user') || '{}')
      const userId = session.id || session.id_usuario || 1

      // Se envía el nuevo contacto al servidor asociado al usuario actual
      const result = await createContactService(data, userId)
      
      // Agregar el contacto creado al state local
      // Se agrega el contacto a la lista local para que aparezca en la tabla sin necesidad de recargar
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

  // Envía los datos modificados de un contacto al servidor y actualiza la lista local para reflejar los cambios al instante
  async function updateContact(id, data) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      // EXTRAEMOS EL ID DEL USUARIO LOGUEADO DESDE LA CLAVE CORRECTA
      const session = JSON.parse(localStorage.getItem('auth_user') || '{}')
      const userId = session.id || session.id_usuario || 1

      // LE PASAMOS EL USERID AL SERVICIO
      // Se envían los cambios al servidor para guardarlos en la base de datos
      const result = await updateContactService(id, data, userId)
      
      // Actualizar en el state local de Vue de forma reactiva
      // Se actualiza el contacto en la lista local para que los cambios se vean de inmediato en la interfaz
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

  // Elimina un contacto del servidor y lo quita de la lista local para que desaparezca de la pantalla al instante
  async function deleteContact(id) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      // Extraemos el ID del usuario logueado desde la clave 'auth_user'
      const session = JSON.parse(localStorage.getItem('auth_user') || '{}')
      const userId = session.id || session.id_usuario || 1

      // Llamamos al servicio modificado
      const result = await deleteContactService(id, userId)
      
      if (result.success) {
        // Remover del array local para que desaparezca visualmente de la tabla al instante
        contacts.value = contacts.value.filter((c) => Number(c.id) !== Number(id))
        successMessage.value = result.message || 'Operación realizada correctamente.'
      } else {
        error.value = result.message || 'No se pudo eliminar el contacto.'
      }
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

  // Actualiza el texto de búsqueda que usa el filtro de contactos en tiempo real
  /**
   * Establece el query de búsqueda.
   * @param {string} query
   */
  function setSearch(query) {
    searchQuery.value = query
  }

  // Genera la dirección web completa para mostrar la foto de un contacto desde el servidor
 /**
 * Construye la URL completa para la foto de un contacto en AwardSpace.
 * @param {string} relativePath
 * @returns {string}
 */
function buildPhotoUrl(relativePath) {
  if (!relativePath) return ''
  
  const base = photoBaseUrl.value || ''
  
  // PARCHE PARA COMPATIBILIDAD CON OTROS BACKENDS:
  // Siempre extraemos el nombre puro del archivo (lo que está después de la última '/')
  // Así ignoramos si el backend manda "foto.jpg" o "uploads/contactos/foto.jpg" o URLs quemadas
  const filename = relativePath.split('/').pop()
  
  return `${base}/uploads/contactos/${filename}`
}
  
  // Se exponen todos los datos y funciones para que los componentes de la app puedan usarlos
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
