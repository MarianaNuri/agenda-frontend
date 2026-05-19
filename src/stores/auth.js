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
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const token = ref(localStorage.getItem('auth_token') || '')
  const loading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  /* ---------- Getters ---------- */
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.nombre_de_usuario || 'Usuario')
  //const userEmail = computed(() => user.value?.email || '')
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
      if (!data.success) {
        throw new Error(data.message || 'Error al registrar usuario.')
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
    if (!token.value) return false

    loading.value = true
    try {
      const data = await getMeService()
      user.value = data.usuario || data
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      return true
    } catch {
      // Token inválido o expirado
      _clearSession()
      return false
    } finally {
      loading.value = false
    }
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
      user.value = data.usuario|| { ...user.value, ...profileData }
      // Si subió foto, no guardamos el File, sino la URL que devuelve el backend
      if (data.usuario) {
        localStorage.setItem('auth_user', JSON.stringify(data.usuario))
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
    token,
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
