<script setup>

// Se importan las herramientas necesarias para la validación de campos y la navegación entre páginas
import { ref } from 'vue'
import { required, minLength, validateAll, } from '@/utils/validators'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Se conecta con el sistema de autent icación y la navegación de la aplicación
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// Datos del formulario: nombre de usuario, contraseña y posible mensaje de error
const nombre_de_usuario = ref('')
const password = ref('')
const localError = ref('')

// Esta función se ejecuta cuando el usuario presiona el botón "Entrar"
async function handleLogin() {
  localError.value = ''
  // Validaciones del formulario
  // Se verifica que los campos estén llenos y que la contraseña tenga al menos 4 caracteres
  const validationError = validateAll([
    required(nombre_de_usuario.value, 'El nombre_de_usuario'),
    required(password.value, 'La contraseña'),
    minLength(password.value, 4, 'La contraseña'),
  ])

  // Si algún campo no cumple las reglas, se muestra el error y no se envía al servidor
  if (validationError) {
    localError.value = validationError
    return
  }

  // Llamar al backend
  // Se envían las credenciales al servidor para verificar si el usuario existe
  const success = await auth.login(nombre_de_usuario.value, password.value)

  if (success) {
    // Redirigir a la ruta original o a la agenda
    // Si el usuario intentó visitar otra página antes, lo lleva ahí; si no, lo lleva a la lista de contactos
    const redirectTo = route.query.redirect || '/agenda'
    router.push(redirectTo)
  } else {
    // El error viene del store
    // Si las credenciales son incorrectas o hay un error del servidor, se muestra el mensaje correspondiente
    localError.value = auth.error
  }
}
</script>

<template>
  <!-- Tarjeta principal del formulario de inicio de sesión -->
  <div class="card" id="login-card" style="margin: 2rem auto;">
    <h2>Iniciar Sesión</h2>

    <!-- Mensaje de éxito -->
    <!-- Se muestra un mensaje verde cuando el registro fue exitoso y el usuario puede iniciar sesión -->
    <p v-if="auth.successMessage" class="detail-label" style="color: #51cf66; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ auth.successMessage }}
    </p>

    <!-- Error -->
    <!-- Se muestra un mensaje rojo si el usuario ingresó datos incorrectos o hubo un problema con el servidor -->
    <p v-if="localError || auth.error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
      {{ localError || auth.error }}
    </p>

    <!-- Formulario donde el usuario escribe sus datos para entrar a la agenda -->
    <form @submit.prevent="handleLogin">
      <!-- Campo para que el usuario escriba su nombre de usuario -->
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

      <!-- Campo para que el usuario escriba su contraseña -->
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

      <!-- Botón para enviar el formulario; se desactiva mientras se procesa la solicitud -->
      <button type="submit" class="btn-submit" id="btn-login-submit" :disabled="auth.loading">
        <span v-if="auth.loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Entrando...
        </span>
        <span v-else>Entrar</span>
      </button>
    </form>

    <!-- Enlace para que los usuarios nuevos puedan ir a la página de registro y crear una cuenta -->
    <RouterLink to="/registro" class="back-link">
      <span class="arrow">&rarr;</span>
      ¿No tienes cuenta? Regístrate
    </RouterLink>
  </div>
</template>
