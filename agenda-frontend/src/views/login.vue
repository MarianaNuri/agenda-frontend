<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'El email es obligatorio.'
    return
  }
  if (!password.value.trim()) {
    error.value = 'La contraseña es obligatoria.'
    return
  }
  if (password.value.length < 4) {
    error.value = 'La contraseña debe tener al menos 4 caracteres.'
    return
  }

  auth.login(email.value, password.value)
  router.push('/agenda')
}
</script>

<template>
  <div class="card" id="login-card" style="margin: 2rem auto;">
    <h2>Iniciar Sesión</h2>

    <!-- Error -->
    <p v-if="error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ error }}
    </p>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="login-email">Email</label>
        <input
          v-model="email"
          type="email"
          id="login-email"
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div class="form-group">
        <label for="login-password">Contraseña</label>
        <input
          v-model="password"
          type="password"
          id="login-password"
          placeholder="Tu contraseña"
          required
        />
      </div>

      <button type="submit" class="btn-submit" id="btn-login-submit">
        <span>Entrar</span>
      </button>
    </form>

    <RouterLink to="/registro" class="back-link">
      <span class="arrow">&rarr;</span>
      ¿No tienes cuenta? Regístrate
    </RouterLink>
  </div>
</template>
