<script setup>
/**
 * views/perfil.vue
 *
 * Vista de perfil del usuario autenticado.
 * Permite ver y editar datos del perfil, subir foto y cerrar sesión.
 * Conecta con el backend via el store de autenticación.
 *
 * Esta página tiene dos modos:
 * - MODO VISTA: muestra la información del usuario con botones para editar o cerrar sesión
 * - MODO EDICIÓN: muestra un formulario para cambiar el nombre de usuario y la foto de perfil
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'
import {
  required,
  validateAll,
} from '@/utils/validators'

// Conexión con el almacén de autenticación y el enrutador de la aplicación
const auth = useAuthStore()
const router = useRouter()

// Estado del perfil: controla si se está editando y guarda los valores temporales
const isEditing = ref(false)
const editNombreUsuario = ref('')
const editFoto = ref(null)
const editFotoPreview = ref('')
const photoBaseUrl = ref('')

// Al cargar la página, se obtienen los datos más recientes del usuario desde el servidor
/* Cargar datos frescos del usuario al montar */
onMounted(async () => {
  await auth.fetchUser()
  try {
    photoBaseUrl.value = await getApiUrl()
  } catch {
    photoBaseUrl.value = ''
  }
})

// Genera la URL de la foto de perfil del usuario
// Si el usuario tiene foto, la muestra; si no, genera un avatar con sus iniciales
/**
 * Construye la URL del avatar del usuario.
 * Prioriza la foto del backend, con fallback a ui-avatars.
 */
const avatarUrl = computed(() => {
  // 1. Si estamos editando y hay preview local, mostrar esa
  if (editFotoPreview.value) return editFotoPreview.value

  // 2. Si el usuario tiene foto, construir la URL absoluta hacia AlwaysData
  if (auth.userPhoto && typeof auth.userPhoto === 'string') {
    // Si ya es una URL completa, devolverla
    if (auth.userPhoto.startsWith('http')) return auth.userPhoto
    
    // Si es solo el nombre, usar buildPhotoUrl del store si es posible, o armarla manual
    return auth.buildPhotoUrl ? auth.buildPhotoUrl(auth.userPhoto) : `https://sistemas-agenda.alwaysdata.net/api/uploads/usuarios/${auth.userPhoto.replace(/^\/+/, '')}`
  }

  // 3. Si no tiene foto, se genera un avatar automático con las iniciales del usuario
  // Fallback a ui-avatars
  const name = encodeURIComponent(auth.userName)
  return `https://ui-avatars.com/api/?name=${name}&background=0044FF&color=fff&size=130`
})

// Activa el modo edición y carga los datos actuales del usuario en el formulario
function startEdit() {
  editNombreUsuario.value = auth.userName
  editFoto.value = null
  editFotoPreview.value = ''
  isEditing.value = true
}

// Cuando el usuario selecciona una nueva foto de perfil, se genera una vista previa
// para que pueda verla antes de guardar los cambios
function onFotoChange(e) {
  const file = e.target.files[0]
  if (file) {
    editFoto.value = file
    // Crear preview local
    const reader = new FileReader()
    reader.onload = (ev) => {
      editFotoPreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Guarda los cambios del perfil: valida que el nombre de usuario no esté vacío
// y envía los datos actualizados (nombre y foto) al servidor
async function saveProfile() {
  // Limpiar error previo
  auth.error = ''

  // Validaciones Front-End
  const validationError = validateAll([
    required(editNombreUsuario.value, 'El nombre de usuario'),
  ])

  // Si hay error, detener envío
  if (validationError) {
    auth.error = validationError
    return
  }

  // Construir datos
  const profileData = {
    nombre_de_usuario: editNombreUsuario.value,
  }

  // Agregar foto si existe
  if (editFoto.value) {
    profileData.foto = editFoto.value
  }

  // Enviar al backend
  const success = await auth.updateProfile(profileData)

  // Si se actualizó correctamente
  if (success) {
    isEditing.value = false
    editFotoPreview.value = ''
  }
}

// Cancela la edición y vuelve al modo vista sin guardar cambios
function cancelEdit() {
  isEditing.value = false
  editFotoPreview.value = ''
}

// Cierra la sesión del usuario y lo redirige a la página de inicio de sesión
async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="card card-detail" id="perfil-card" style="margin: 2rem auto;">
    <h2>Mi Perfil</h2>

    <!-- Mensajes de éxito o error después de guardar cambios en el perfil -->
    <!-- Mensajes de feedback -->
    <Transition name="slide-up">
      <p v-if="auth.successMessage" class="detail-label" style="color: #51cf66; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
        <i class="fa-solid fa-circle-check"></i> {{ auth.successMessage }}
      </p>
    </Transition>
    <Transition name="slide-up">
      <p v-if="auth.error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0;">
        <i class="fa-solid fa-circle-exclamation"></i> {{ auth.error }}
      </p>
    </Transition>

    <!-- Foto de perfil del usuario (o avatar generado con iniciales si no tiene foto) -->
    <!-- Avatar -->
    <div class="detail-photo">
      <img :src="avatarUrl" :alt="auth.userName" />
    </div>

    <!-- Indicador de carga mientras se obtienen los datos del usuario -->
    <!-- Loading -->
    <div v-if="auth.loading && !isEditing" style="text-align: center; padding: 1rem;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #55AAFF;"></i>
    </div>

    <!-- MODO VISTA: muestra la información del usuario y los botones de acción -->
    <!-- Modo visualización -->
    <template v-if="!isEditing && !auth.loading">
      <h3 class="detail-name">{{ auth.userName }}</h3>

      <div class="detail-info">
        <div class="detail-row">
          <i class="fa-solid fa-user"></i>
          <div>
            <span class="detail-label">Nombre de usuario</span>
            <span class="detail-value">{{ auth.userName }}</span>
          </div>
        </div>
      </div>

      <!-- Botones para editar el perfil o cerrar sesión -->
      <div class="contact-actions" style="gap: .75rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem;">
        <button class="btn-new-contact" id="btn-edit-profile" @click="startEdit" style="border: none;">
          <i class="fa-solid fa-pen"></i>
          <span>Editar Perfil</span>
        </button>
        <!-- Botón de cerrar sesión: termina la sesión y redirige al login -->
        <button class="btn-action btn-delete" id="btn-logout" @click="handleLogout" title="Cerrar sesión" style="width: auto; height: auto; padding: .65rem 1.3rem; border-radius: 12px; font-size: .9rem; border: none;">
          <i class="fa-solid fa-right-from-bracket"></i>
          Cerrar Sesión
        </button>
      </div>
    </template>

    <!-- MODO EDICIÓN: formulario para cambiar el nombre de usuario y la foto de perfil -->
    <!-- Modo edición -->
    <template v-if="isEditing">
      <form @submit.prevent="saveProfile" style="margin-top: 1rem;">
        <!-- Campo para modificar el nombre de usuario -->
        <div class="form-group">
          <label for="edit-nombre_de_usuario">Nombre de usuario</label>
          <input v-model="editNombreUsuario" type="text" id="edit-nombre_de_usuario" required />
        </div>

        <!-- Selector de foto de perfil con vista previa antes de guardar -->
        <!-- Foto de perfil -->
        <div class="form-group">
          <label>Foto de perfil</label>
          <div class="file-wrapper">
            <span class="file-icon">📷</span>
            <span class="file-text">{{ editFoto ? editFoto.name : 'Cambiar foto...' }}</span>
            <input
              type="file"
              id="edit-foto"
              accept="image/*"
              @change="onFotoChange"
            />
          </div>
        </div>

        <!-- Botones para guardar los cambios o cancelar la edición -->
        <div class="contact-actions" style="gap: .75rem; justify-content: center; margin-top: 1rem;">
          <button type="submit" class="btn-submit" id="btn-save-profile" :disabled="auth.loading">
            <span v-if="auth.loading">
              <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
            </span>
            <span v-else>Guardar</span>
          </button>
          <button type="button" class="btn-action btn-delete" @click="cancelEdit" style="width: auto; height: auto; padding: .65rem 1.3rem; border-radius: 12px; border: none;">
            Cancelar
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
