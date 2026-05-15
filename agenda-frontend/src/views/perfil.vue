<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const isEditing = ref(false)
const editNombre = ref('')
const editEmail = ref('')

const avatarUrl = computed(() => {
  const name = encodeURIComponent(auth.userName)
  return `https://ui-avatars.com/api/?name=${name}&background=0044FF&color=fff&size=130`
})

function startEdit() {
  editNombre.value = auth.userName
  editEmail.value = auth.userEmail
  isEditing.value = true
}

function saveProfile() {
  auth.updateProfile({
    nombre: editNombre.value,
    email: editEmail.value,
  })
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="card card-detail" id="perfil-card" style="margin: 2rem auto;">
    <h2>Mi Perfil</h2>

    <!-- Avatar -->
    <div class="detail-photo">
      <img :src="avatarUrl" :alt="auth.userName" />
    </div>

    <!-- Modo visualización -->
    <template v-if="!isEditing">
      <h3 class="detail-name">{{ auth.userName }}</h3>

      <div class="detail-info">
        <div class="detail-row">
          <i class="fa-solid fa-user"></i>
          <div>
            <span class="detail-label">Nombre</span>
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
    <template v-else>
      <form @submit.prevent="saveProfile" style="margin-top: 1rem;">
        <div class="form-group">
          <label for="edit-nombre">Nombre</label>
          <input v-model="editNombre" type="text" id="edit-nombre" required />
        </div>
        <div class="form-group">
          <label for="edit-email">Email</label>
          <input v-model="editEmail" type="email" id="edit-email" required />
        </div>

        <div class="contact-actions" style="gap: .75rem; justify-content: center; margin-top: 1rem;">
          <button type="submit" class="btn-submit" id="btn-save-profile">
            <span>Guardar</span>
          </button>
          <button type="button" class="btn-action btn-delete" @click="cancelEdit" style="width: auto; height: auto; padding: .65rem 1.3rem; border-radius: 12px; border: none;">
            Cancelar
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
