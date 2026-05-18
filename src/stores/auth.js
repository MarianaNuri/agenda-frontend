import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  loginService,
  registerService,
  getMeService,
  logoutService,
  updateProfileService,
} from '@/api/auth'
import { getApiUrl } from '@/config/api'

export const useAuthStore = defineStore('auth', () => {
 /* ---------- State ---------- */
// Eliminamos la lectura del auth_token
const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

/* ---------- Getters ---------- */
// Ahora estás autenticado SI existe el objeto user en el estado
const isAuthenticated = computed(() => !!user.value)
const userName = computed(() => user.value?.nombre_de_usuario || 'Usuario')
const userPhoto = computed(() => user.value?.foto || null)

  /* ---------- Helpers privados ---------- */

  /** Guarda el usuario en localStorage y en el state */
function _setSession(newUser) {
  user.value = newUser
  localStorage.setItem('auth_user', JSON.stringify(newUser))
}

/** Limpia la sesión */
function _clearSession() {
  user.value = null
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
   * Iniciar sesión con email y contraseña.
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
      // Pasamos directamente el objeto user que mandó PHP
      _setSession(data.user) 
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

  async function register(nombre_de_usuario, password) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      const data = await registerService(nombre_de_usuario, password)
      // Al registrarse con éxito, le iniciamos sesión guardando su usuario
      _setSession(data.user) 
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
   * Cerrar sesión.
   */
  async function logout() {
    loading.value = true
    try {
      await logoutService()
    } catch {
      // Aunque falle en el server, cerramos la sesión local
      console.warn('[auth] No se pudo cerrar sesión en el servidor.')
    } finally {
      _clearSession()
      loading.value = false
    }
  }

  /**
   * Obtener datos del usuario autenticado (verificar token).
   * @returns {Promise<boolean>} true si el token es válido
   */
  async function fetchUser() {
    // Si hay un usuario en el estado, asumimos que la sesión sigue activa localmente
    return !!user.value
  }

  /**
   * Actualizar perfil del usuario.
   * @param {Object} profileData - { nombre, email, foto? }
   * @returns {Promise<boolean>}
   */
  async function updateProfile(profileData) {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
      const data = await updateProfileService(profileData)
      // Actualizar datos locales
      user.value = data.user || { ...user.value, ...profileData }
      // Si subió foto, no guardamos el File, sino la URL que devuelve el backend
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      } else {
        const updated = { ...user.value }
        delete updated.foto // No guardar File en localStorage
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
   * Construye la URL completa de una foto del servidor.
   * @param {string} relativePath - Ruta relativa devuelta por el backend
   * @returns {Promise<string>}
   */
  async function buildPhotoUrl(relativePath) {
    if (!relativePath) return ''
    // Si ya es una URL completa, devolverla tal cual
    if (relativePath.startsWith('http')) return relativePath
    const base = await getApiUrl()
    return `${base}/${relativePath.replace(/^\/+/, '')}`
  }

  return {
    // State
    user,
    loading,
    error,
    successMessage,
    // Getters
    isAuthenticated,
    userName,
    //userEmail,
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
