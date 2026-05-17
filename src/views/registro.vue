<script setup>
/**
 * views/registro.vue
 *
 * Vista de registro de usuario.
 * Conecta con el backend via el store de autenticación.
 * Incluye validación completa de formulario.
 */
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  required,
  email as emailValidator,
  minLength,
  matches,
  validateAll,
} from '@/utils/validators'

const auth = useAuthStore()
const router = useRouter()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

async function handleRegister() {
  localError.value = ''

  // Validaciones del formulario
  const validationError = validateAll([
    required(nombre.value, 'El nombre'),
    required(email.value, 'El email'),
    emailValidator(email.value),
    required(password.value, 'La contraseña'),
    minLength(password.value, 4, 'La contraseña'),
    matches(password.value, confirmPassword.value),
  ])

  if (validationError) {
    localError.value = validationError
    return
  }

  // Llamar al backend
  const success = await auth.register(nombre.value, email.value, password.value)

  if (success) {
    router.push('/agenda')
  } else {
    localError.value = auth.error
  }
}
</script>

<template>
  <div class="card" id="registro-card" style="margin: 2rem auto;">
    <h2>Registro</h2>

    <!-- Mensaje de éxito -->
    <p v-if="auth.successMessage" class="detail-label" style="color: #51cf66; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ auth.successMessage }}
    </p>

    <!-- Error -->
    <p v-if="localError || auth.error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ localError || auth.error }}
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

      <button type="submit" class="btn-submit" id="btn-registro-submit" :disabled="auth.loading">
        <span v-if="auth.loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Registrando...
        </span>
        <span v-else>Registrarse</span>
      </button>
    </form>

    <RouterLink to="/login" class="back-link">
      <span class="arrow">&larr;</span>
      ¿Ya tienes cuenta? Inicia sesión
    </RouterLink>
  </div>
</template>
