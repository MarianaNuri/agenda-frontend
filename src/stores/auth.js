// Este archivo es el almacén (store) de autenticación de la agenda.
// Se encarga de todo lo relacionado con el inicio de sesión, registro,
// cierre de sesión y la gestión del perfil del usuario.
// Gracias a este store, la app sabe quién está usando la agenda en todo momento.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  loginService,
  registerService,
  getMeService,
  logoutService,
  updateProfileService,
} from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  /* ---------- State ---------- */
  // Se recuperan los datos del usuario guardados en el navegador para que la sesión no se pierda al refrescar la página
  const savedUser = localStorage.getItem('auth_user')

  // Datos del usuario que inició sesión (nombre, foto, id, etc.)
  const user = ref(
    savedUser && savedUser !== 'undefined'
      ? JSON.parse(savedUser)
      : null
  )
  // Token de autenticación que identifica la sesión activa del usuario
  const token = ref(localStorage.getItem('auth_token') || '')
  // Indica si se está procesando alguna operación (para mostrar un indicador de carga en la interfaz)
  const loading = ref(false)
  // Mensaje de error que se muestra al usuario cuando algo falla
  const error = ref('')
  // Mensaje de éxito que se muestra al usuario cuando una operación se completa correctamente
  const successMessage = ref('')

  /* ---------- Getters ---------- */
  // Permite saber si hay un usuario con sesión activa (si existe un token válido)
  const isAuthenticated = computed(() => !!token.value)
  // Proporciona acceso rápido al nombre del usuario para mostrarlo en la interfaz
  const userName = computed(() => user.value?.nombre_de_usuario || 'Usuario')
  // Proporciona acceso rápido a la foto del usuario para mostrarla en el perfil o la barra de navegación
  const userPhoto = computed(() => user.value?.foto || null)

  /* ---------- Helpers privados ---------- */

  // Guarda los datos de la sesión del usuario tanto en la memoria de la app como en el navegador
  /** Guarda token y usuario en localStorage y en el state */
  function _setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  // Elimina todos los datos de la sesión cuando el usuario cierra sesión o cuando el token expira
  /** Limpia la sesión */
  function _clearSession() {
    token.value = ''
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  // Hace que los mensajes de éxito o error desaparezcan automáticamente después de 5 segundos
  /** Limpia mensajes después de un tiempo */
  function _autoClearMessages(delayMs = 5000) {
    setTimeout(() => {
      error.value = ''
      successMessage.value = ''
    }, delayMs)
  }

  /* ---------- Actions ---------- */

  // Permite al usuario iniciar sesión en la agenda con su nombre de usuario y contraseña
  /**
   * Iniciar sesión con nombre de usuario y contraseña.
   * @param {string} nombre_de_usuario
   * @param {string} password
   * @returns {Promise<boolean>} true si login exitoso
   */
  async function login(nombre_de_usuario, password) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      // Se envían las credenciales al servidor para validar al usuario
      const data = await loginService(nombre_de_usuario, password)
      if (!data) {
        throw new Error('El servidor no devolvió una respuesta válida.')
      }
      if (!data.success) {
        throw new Error(data.message || 'Error al iniciar sesión.')
      }
      // Si las credenciales son correctas, se guarda la sesión para que el usuario acceda a su agenda
      _setSession(data.token, data.usuario)
      successMessage.value = data.message || '¡Bienvenido!'
      _autoClearMessages()
      return true
    } catch (err) {
      error.value = err.message || 'Error al iniciar sesión.'
      _autoClearMessages()
      return false
    } finally {
      loading.value = false
    }
  }

  // Permite crear una nueva cuenta de usuario y lo deja logueado automáticamente en la agenda
  /**
   * Registrar nuevo usuario.
   * @param {string} nombre_de_usuario
   * @param {string} password
   * @returns {Promise<boolean>} true si registro exitoso
   */
  async function register(nombre_de_usuario, password) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      // Se envían los datos al servidor para crear la nueva cuenta
      const data = await registerService(nombre_de_usuario, password)
      if (!data) {
        throw new Error('El servidor no devolvió una respuesta válida. Verifica que el backend esté configurado correctamente.')
      }
      if (!data.success) {
        throw new Error(data.message || 'Error al registrar usuario.')
      }
      if (!data.token || !data.usuario) {
        throw new Error('El registro fue exitoso pero el servidor no devolvió los datos de sesión. Intenta iniciar sesión manualmente.')
      }
      // Después de registrarse, se inicia sesión automáticamente para que el usuario entre directo a su agenda
      _setSession(data.token, data.usuario)
      successMessage.value = data.message || '¡Cuenta creada con éxito!'
      _autoClearMessages()
      return true
    } catch (err) {
      error.value = err.message || 'Error al registrar la cuenta.'
      _autoClearMessages()
      return false
    } finally {
      loading.value = false
    }
  }

  // Cierra la sesión del usuario: avisa al servidor y luego limpia todos los datos locales
  /**
   * Cerrar sesión de manera segura pasándole el ID al backend.
   */
  async function logout() {
    loading.value = true
    try {
      // Extraemos el ID del usuario actual para avisarle a logout.php
      const userId = user.value?.id || null
      await logoutService(userId)
    } catch {
      console.warn('[auth] No se pudo cerrar sesión en el servidor, limpiando localmente.')
    } finally {
      // Sin importar si el servidor respondió o no, se eliminan los datos de sesión del navegador
      _clearSession()
      loading.value = false
    }
  }

  // Obtiene la información más reciente del perfil del usuario desde el servidor
  /**
   * Obtener datos del usuario autenticado (perfil dinámico).
   * @returns {Promise<boolean>} true si se cargó correctamente
   */
  async function fetchUser() {
    if (!token.value) return false

    loading.value = true
    try {
      // Pasamos el ID del usuario actual al servicio de perfil
      const userId = user.value?.id || 1
      const data = await getMeService(userId)
      
      // Adaptamos por si el backend responde con data.user o data.usuario
      // Se actualiza la información del usuario en la app y en el navegador
      user.value = data.user || data.usuario || data
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      return true
    } catch {
      // Si llega a fallar la red, mantenemos la sesión del localStorage para no sacarlo bruscamente
      loading.value = false
      return true 
    } finally {
      loading.value = false
    }
  }

  // Permite al usuario cambiar su nombre de usuario y/o su foto de perfil
  // ACTUALIZAR PERFILES
async function updateProfile(profileData) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      //  Extraemos el ID del estado global (con soporte por si se llama id o id_usuario)
      const userId = user.value?.id || user.value?.id_usuario

      //  Se lo pasamos como segundo parámetro al servicio de la API
      // Se envían los nuevos datos del perfil al servidor para que se guarden
      const data = await updateProfileService(profileData, userId)
      
      // Se actualiza la información del usuario en la app con los datos que devolvió el servidor
      user.value = data.usuario || data.user || { ...user.value, ...profileData }
      
      if (data.usuario || data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.usuario || data.user))
      } else {
        const updated = { ...user.value }
        delete updated.foto 
        localStorage.setItem('auth_user', JSON.stringify(updated))
      }
      successMessage.value = data.message || 'Perfil actualizado correctamente.'
      _autoClearMessages()
      return true
    } catch (err) {
      error.value = err.message || 'Error al actualizar el perfil.'
      _autoClearMessages()
      return false
    } finally {
      loading.value = false
    }
  }

  // Genera la dirección web completa para mostrar la foto de perfil del usuario desde el servidor
/**
   * Construye la URL completa de una foto del servidor de manera dinámica.
   * @param {string} relativePath
   * @returns {string}
   */
  function buildPhotoUrl(relativePath) {
    if (!relativePath) return ''
    if (relativePath.startsWith('http')) return relativePath
  
    //Cambiado al domini de AlwaysData
    return `https://sistemas-agenda.alwaysdata.net/api/uploads/usuarios/${relativePath.replace(/^\/+/, '')}`
  }

  // Se exponen todos los datos y funciones para que los componentes de la app puedan usarlos
  return {
    // State
    user,
    token,
    loading,
    error,
    successMessage,
    // Getters
    isAuthenticated,
    userName,
    userPhoto,
    // Actions
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    buildPhotoUrl,
  }
})
