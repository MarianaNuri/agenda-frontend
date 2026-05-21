/**
 * src/stogisters/auth.js
 *
 * Store Pinia de contactos.
 * Reemplaza los datos demo por consumo real del backend via API REST.
 */

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
  const savedUser = localStorage.getItem('auth_user')

  const user = ref(
    savedUser && savedUser !== 'undefined'
      ? JSON.parse(savedUser)
      : null
  )
  const token = ref(localStorage.getItem('auth_token') || '')
  const loading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  /* ---------- Getters ---------- */
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.nombre_de_usuario || 'Usuario')
  const userPhoto = computed(() => user.value?.foto || null)

  /* ---------- Helpers privados ---------- */

  /** Guarda token y usuario en localStorage y en el state */
  function _setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  /** Limpia la sesión */
  function _clearSession() {
    token.value = ''
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  /** Limpia mensajes después de un tiempo */
  function _autoClearMessages(delayMs = 5000) {
    setTimeout(() => {
      error.value = ''
      successMessage.value = ''
    }, delayMs)
  }

  /* ---------- Actions ---------- */

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
      const data = await loginService(nombre_de_usuario, password)
      if (!data) {
        throw new Error('El servidor no devolvió una respuesta válida.')
      }
      if (!data.success) {
        throw new Error(data.message || 'Error al iniciar sesión.')
      }
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

  /**
   * Cerrar sesión de manera segura pasándole el ID al backend.
   */
  async function logout() {
    loading.value = true
    try {
      // 🔍 Extraemos el ID del usuario actual para avisarle a logout.php
      const userId = user.value?.id || null
      await logoutService(userId)
    } catch {
      console.warn('[auth] No se pudo cerrar sesión en el servidor, limpiando localmente.')
    } finally {
      // 🔍 SE LIMPIA SÍ O SÍ
      _clearSession()
      loading.value = false
    }
  }

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

  // ACTUALIZAR PERFILES
async function updateProfile(profileData) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      //  Extraemos el ID del estado global (con soporte por si se llama id o id_usuario)
      const userId = user.value?.id || user.value?.id_usuario

      //  Se lo pasamos como segundo parámetro al servicio de la API
      const data = await updateProfileService(profileData, userId)
      
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

  /**
/**
   * Construye la URL completa de una foto del servidor de manera dinámica.
   * @param {string} relativePath
   * @returns {string}
   */
  function buildPhotoUrl(relativePath) {
    if (!relativePath) return ''
    if (relativePath.startsWith('http')) return relativePath
  
    return `http://proyectou5agenda.atwebpages.com/api/uploads/usuarios/${relativePath.replace(/^\/+/, '')}`
  }

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
