import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  /* ---------- State ---------- */
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const token = ref(localStorage.getItem('auth_token') || '')

  /* ---------- Getters ---------- */
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.nombre || 'Usuario')
  const userEmail = computed(() => user.value?.email || '')

  /* ---------- Actions ---------- */

  /** Simula login (reemplazar con fetch real al backend) */
  function login(email, password) {
    // TODO: conectar con API real
    const fakeUser = { id: 1, nombre: 'Usuario Demo', email }
    const fakeToken = 'demo-token-' + Date.now()

    user.value = fakeUser
    token.value = fakeToken
    localStorage.setItem('auth_user', JSON.stringify(fakeUser))
    localStorage.setItem('auth_token', fakeToken)
  }

  /** Simula registro */
  function register(nombre, email, password) {
    // TODO: conectar con API real
    const fakeUser = { id: 1, nombre, email }
    const fakeToken = 'demo-token-' + Date.now()

    user.value = fakeUser
    token.value = fakeToken
    localStorage.setItem('auth_user', JSON.stringify(fakeUser))
    localStorage.setItem('auth_token', fakeToken)
  }

  /** Cierra sesión */
  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  /** Actualiza perfil */
  function updateProfile(data) {
    user.value = { ...user.value, ...data }
    localStorage.setItem('auth_user', JSON.stringify(user.value))
  }

  return {
    user,
    token,
    isAuthenticated,
    userName,
    userEmail,
    login,
    register,
    logout,
    updateProfile,
  }
})
