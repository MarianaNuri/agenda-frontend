<script setup>

// Se importan las herramientas para validar los datos del formulario y navegar entre páginas
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'//se conecta con el backend con el store de autenticacion
import {
  required,
  minLength,
  matches,
  validateAll,
} from '@/utils/validators'

// Se conecta con el sistema de autenticación y la navegación
const auth = useAuthStore()
const router = useRouter()

// Datos del formulario: nombre de usuario, contraseña, confirmación de contraseña y posible error
const nombre_de_usuario = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

// Esta función se ejecuta cuando el usuario presiona el botón "Registrarse"
async function handleRegister() {
  localError.value = ''

  // Validaciones del formulario
  // Se verifica: nombre de usuario requerido, contraseña mínimo 4 caracteres, y que ambas contraseñas coincidan
  const validationError = validateAll([
    required(nombre_de_usuario.value, 'El nombre_de_usuario'),
    required(password.value, 'La contraseña'),
    minLength(password.value, 4, 'La contraseña'),
    matches(password.value, confirmPassword.value),
  ])

  // Si los datos no cumplen las reglas, se muestra el error sin enviar nada al servidor
  if (validationError) {
    localError.value = validationError
    return
  }

  // Llamar al backend
  // Se envían los datos al servidor para crear la nueva cuenta del usuario
  const success = await auth.register(nombre_de_usuario.value, password.value)

  // Si el registro es exitoso, se inicia sesión automáticamente y se redirige a la lista de contactos
  if (success) {
    router.push('/agenda')
  } else {
    // Si hubo un problema (por ejemplo, el nombre de usuario ya existe), se muestra el error
    localError.value = auth.error
  }
}
</script>

<template>
  <!-- Tarjeta principal del formulario de registro -->
  <div class="card" id="registro-card" style="margin: 2rem auto;">
    <h2>Registro</h2>

    <!-- Mensaje de éxito -->
    <!-- Se muestra un mensaje verde si el proceso de registro fue exitoso -->
    <p v-if="auth.successMessage" class="detail-label" style="color: #51cf66; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ auth.successMessage }}
    </p>

    <!-- Error -->
    <!-- Se muestra un mensaje rojo si hay un error de validación o del servidor -->
    <p v-if="localError || auth.error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ localError || auth.error }}
    </p>

    <!-- Formulario donde el usuario ingresa los datos para crear su cuenta -->
    <form @submit.prevent="handleRegister">
      <!-- Campo para elegir un nombre de usuario -->
      <div class="form-group">
        <label for="reg-nombre_de_usuario">Nombre de usuario</label>
        <input
          v-model="nombre_de_usuario"
          type="text"
          id="reg-nombre"
          placeholder="Tu nombre de usuario"
          required
        />
      </div>

      <!-- Campo para crear una contraseña -->
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

      <!-- Campo para confirmar la contraseña (debe coincidir con la anterior) -->
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

      <!-- Botón para enviar el formulario; se desactiva mientras se procesa -->
      <button type="submit" class="btn-submit" id="btn-registro-submit" :disabled="auth.loading">
        <span v-if="auth.loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Registrando...
        </span>
        <span v-else>Registrarse</span>
      </button>
    </form>

    <!-- Enlace para usuarios que ya tienen cuenta y quieren ir a la página de inicio de sesión -->
    <RouterLink to="/login" class="back-link">
      <span class="arrow">&larr;</span>
      ¿Ya tienes cuenta? Inicia sesión
    </RouterLink>
  </div>
</template>

