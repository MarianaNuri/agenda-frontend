<script setup>
/**
 * views/login.vue
 *
 * Vista de inicio de sesión.
 * Conecta con el backend via el store de autenticación.
 * Incluye validación de formulario y mensajes de error/éxito.
 */
import { ref } from 'vue'
import { required, minLength, validateAll, } from '@/utils/validators'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const nombre_de_usuario = ref('')
const password = ref('')
const localError = ref('')

async function handleLogin() {
  localError.value = ''

  // Validaciones del formulario
  const validationError = validateAll([
    required(nombre_de_usuario.value, 'El nombre_de_usuario'),
    required(password.value, 'La contraseña'),
    minLength(password.value, 4, 'La contraseña'),
  ])

  if (validationError) {
    localError.value = validationError
    return
  }

  // Llamar al backend
  const success = await auth.login(nombre_de_usuario.value, password.value)

  if (success) {
    // Redirigir a la ruta original o a la agenda
    const redirectTo = route.query.redirect || '/agenda'
    router.push(redirectTo)
  } else {
    // El error viene del store
    localError.value = auth.error
  }
}
</script>

<template>
  <div class="card" id="login-card" style="margin: 2rem auto;">
    <h2>Iniciar Sesión</h2>

    <!-- Mensaje de éxito -->
    <p v-if="auth.successMessage" class="detail-label" style="color: #51cf66; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ auth.successMessage }}
    </p>

    <!-- Error -->
    <p v-if="localError || auth.error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ localError || auth.error }}
    </p>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="login-nombre_de_usuario">Nombre de usuario</label>
        <input
          v-model="nombre_de_usuario"
          type="text"
          id="login-nombre_de_usuario"
          placeholder="admin"
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

      <button type="submit" class="btn-submit" id="btn-login-submit" :disabled="auth.loading">
        <span v-if="auth.loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Entrando...
        </span>
        <span v-else>Entrar</span>
      </button>
    </form>

    <RouterLink to="/registro" class="back-link">
      <span class="arrow">&rarr;</span>
      ¿No tienes cuenta? Regístrate
    </RouterLink>
  </div>
</template>
