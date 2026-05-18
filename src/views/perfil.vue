<script setup>
/**
 * views/perfil.vue
 *
 * Vista de perfil del usuario autenticado.
 * Permite ver y editar datos del perfil, subir foto y cerrar sesión.
 * Conecta con el backend via el store de autenticación.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'

const auth = useAuthStore()
const router = useRouter()

const isEditing = ref(false)
const editNombreUsuario = ref('')
const editEmail = ref('')
const editFoto = ref(null)
const editFotoPreview = ref('')
const photoBaseUrl = ref('')

/* Cargar datos frescos del usuario al montar */
onMounted(async () => {
  await auth.fetchUser()
  try {
    photoBaseUrl.value = await getApiUrl()
  } catch {
    photoBaseUrl.value = ''
  }
})

/**
 * Construye la URL del avatar del usuario.
 * Prioriza la foto del backend, con fallback a ui-avatars.
 */
const avatarUrl = computed(() => {
  // Si estamos editando y hay preview, mostrar esa
  if (editFotoPreview.value) return editFotoPreview.value

  // Si el usuario tiene foto del backend
  if (auth.userPhoto) {
    if (auth.userPhoto.startsWith('http')) return auth.userPhoto
    return `${photoBaseUrl.value}/${auth.userPhoto.replace(/^\/+/, '')}`
  }

  // Fallback a ui-avatars
  const name = encodeURIComponent(auth.userName)
  return `https://ui-avatars.com/api/?name=${name}&background=0044FF&color=fff&size=130`
})

function startEdit() {
  editNombreUsuario.value = auth.userName
  editEmail.value = auth.userEmail
  editFoto.value = null
  editFotoPreview.value = ''
  isEditing.value = true
}

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

async function saveProfile() {
  const profileData = {
    nombre_de_usuario: editNombreUsuario.value,
    email: editEmail.value,
  }
  if (editFoto.value) {
    profileData.foto = editFoto.value
  }

  const success = await auth.updateProfile(profileData)
  if (success) {
    isEditing.value = false
    editFotoPreview.value = ''
  }
}

function cancelEdit() {
  isEditing.value = false
  editFotoPreview.value = ''
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="card card-detail" id="perfil-card" style="margin: 2rem auto;">
    <h2>Mi Perfil</h2>

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

    <!-- Avatar -->
    <div class="detail-photo">
      <img :src="avatarUrl" :alt="auth.userName" />
    </div>

    <!-- Loading -->
    <div v-if="auth.loading && !isEditing" style="text-align: center; padding: 1rem;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #55AAFF;"></i>
    </div>

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
        <div class="detail-row">
          <i class="fa-solid fa-envelope"></i>
          <div>
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ auth.userEmail }}</span>
          </div>
        </div>
      </div>

      <div class="contact-actions" style="gap: .75rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem;">
        <button class="btn-new-contact" id="btn-edit-profile" @click="startEdit" style="border: none;">
          <i class="fa-solid fa-pen"></i>
          <span>Editar Perfil</span>
        </button>
        <button class="btn-action btn-delete" id="btn-logout" @click="handleLogout" title="Cerrar sesión" style="width: auto; height: auto; padding: .65rem 1.3rem; border-radius: 12px; font-size: .9rem; border: none;">
          <i class="fa-solid fa-right-from-bracket"></i>
          Cerrar Sesión
        </button>
      </div>
    </template>

    <!-- Modo edición -->
    <template v-if="isEditing">
      <form @submit.prevent="saveProfile" style="margin-top: 1rem;">
        <div class="form-group">
          <label for="edit-nombre_de_usuario">Nombre de usuario</label>
          <input v-model="editNombreUsuario" type="text" id="edit-nombre_de_usuario" required />
        </div>
        <div class="form-group">
          <label for="edit-email">Email</label>
          <input v-model="editEmail" type="email" id="edit-email" required />
        </div>

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
