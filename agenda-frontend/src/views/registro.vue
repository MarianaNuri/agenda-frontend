<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

function handleRegister() {
  error.value = ''

  if (!nombre.value.trim()) {
    error.value = 'El nombre es obligatorio.'
    return
  }
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
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  auth.register(nombre.value, email.value, password.value)
  router.push('/agenda')
}
</script>

<template>
  <div class="card" id="registro-card" style="margin: 2rem auto;">
    <h2>Registro</h2>

    <!-- Error -->
    <p v-if="error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ error }}
    </p>

    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="reg-nombre">Nombre</label>
        <input
          v-model="nombre"
          type="text"
          id="reg-nombre"
          placeholder="Tu nombre completo"
          required
        />
      </div>

      <div class="form-group">
        <label for="reg-email">Email</label>
        <input
          v-model="email"
          type="email"
          id="reg-email"
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div class="form-group">
        <label for="reg-password">Contraseña</label>
        <input
          v-model="password"
          type="password"
          id="reg-password"
          placeholder="Crea una contraseña"
          required
        />
      </div>

      <div class="form-group">
        <label for="reg-confirm-password">Confirmar Contraseña</label>
        <input
          v-model="confirmPassword"
          type="password"
          id="reg-confirm-password"
          placeholder="Repite tu contraseña"
          required
        />
      </div>

      <button type="submit" class="btn-submit" id="btn-registro-submit">
        <span>Registrarse</span>
      </button>
    </form>

    <RouterLink to="/login" class="back-link">
      <span class="arrow">&larr;</span>
      ¿Ya tienes cuenta? Inicia sesión
    </RouterLink>
  </div>
</template>
