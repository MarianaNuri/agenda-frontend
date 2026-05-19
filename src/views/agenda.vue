<script setup>
/**
 * views/agenda.vue
 *
 * Vista principal de contactos.
 * Carga los contactos del backend al montar el componente.
 * Incluye búsqueda, eliminación con confirmación y mensajes de feedback.
 */
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'
import DeleteModal from '@/components/DeleteModal.vue'

const store = useContactStore()
const auth = useAuthStore()
const route = useRoute()

const localSearch = ref('')
const contactToDelete = ref(null)
const showDeleteModal = ref(false)
//const photoBaseUrl = ref('')

/* Cargar contactos del backend al montar */
onMounted(async () => {
  // Obtener la URL base para las fotos
  //try {
  //  photoBaseUrl.value = await getApiUrl()
  //} catch {
  //  photoBaseUrl.value = ''
  //}

  // Cargar contactos
  await store.fetchContacts()
  //para verificar que datos llegan
  console.log(store.filteredContacts)

  // Tomar query param si viene del header
  if (route.query.q) {
    localSearch.value = route.query.q
    store.setSearch(route.query.q)
  }
})

function handleSearch() {
  store.setSearch(localSearch.value)
}

function clearSearch() {
  localSearch.value = ''
  store.setSearch('')
}

/**
 * Construye la URL de la foto de un contacto usando el helper de Pinia.
 * Si no tiene foto, usa ui-avatars como respaldo con sus iniciales.
 */
function getContactPhotoUrl(contact) {
  if (contact.foto) {
    return store.buildPhotoUrl(contact.foto)
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.nombre)}&background=0044FF&color=fff&size=52`
}
/* Delete flow */
function askDelete(contact) {
  contactToDelete.value = contact
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (contactToDelete.value) {
    await store.deleteContact(contactToDelete.value.id)
  }
  showDeleteModal.value = false
  contactToDelete.value = null
}

function cancelDelete() {
  showDeleteModal.value = false
  contactToDelete.value = null
}
</script>

<template>
  <div class="contacts-container" id="agenda-view">
    <!-- Mensajes de feedback -->
    <Transition name="slide-up">
      <p v-if="store.successMessage" class="detail-label" style="color: #51cf66; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0; background: rgba(81, 207, 102, 0.1); padding: 0.75rem 1rem; border-radius: 10px;">
        <i class="fa-solid fa-circle-check"></i> {{ store.successMessage }}
      </p>
    </Transition>
    <Transition name="slide-up">
      <p v-if="store.error" class="detail-label" style="color: #ff6b6b; text-align: center; margin-bottom: 1rem; text-transform: none; letter-spacing: 0; background: rgba(255, 107, 107, 0.1); padding: 0.75rem 1rem; border-radius: 10px;">
        <i class="fa-solid fa-circle-exclamation"></i> {{ store.error }}
      </p>
    </Transition>

    <!-- Header -->
    <div class="contacts-header">
      <h2 class="contacts-title">
        <i class="fa-solid fa-users"></i>
        Mis Contactos
      </h2>
      <RouterLink to="/agenda/crear" class="btn-new-contact" id="btn-nuevo-contacto">
        <i class="fa-solid fa-user-plus"></i>
        <span>Nuevo Contacto</span>
      </RouterLink>
    </div>

    <!-- Buscador inline -->
    <div class="search-bar" id="search-bar">
      <div class="search-input-wrapper">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input
          v-model="localSearch"
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          id="search-input"
          @keyup.enter="handleSearch"
        />
      </div>
      <button class="btn-search" id="btn-search" @click="handleSearch">Buscar</button>
      <a
        v-if="store.searchQuery"
        href="#"
        class="btn-clear"
        id="btn-clear-search"
        @click.prevent="clearSearch"
      >Limpiar</a>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="contacts-empty" id="loading-state">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: #55AAFF;"></i>
      <p>Cargando contactos...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="store.filteredContacts.length === 0" class="contacts-empty" id="empty-state">
      <i class="fa-solid fa-user-slash" style="font-size: 3rem; color: #55AAFF;"></i>
      <p v-if="store.searchQuery">No se encontraron contactos para "{{ store.searchQuery }}".</p>
      <p v-else>Aún no tienes contactos. ¡Agrega el primero!</p>
      <br />
      <RouterLink to="/agenda/crear" class="btn-new-contact">
        <i class="fa-solid fa-user-plus"></i>
        <span>Agregar Contacto</span>
      </RouterLink>
    </div>

    <!-- Tabla de contactos -->
    <div v-else class="contacts-table-wrapper" id="contacts-table-wrapper">
      <table class="contacts-table" id="contacts-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in store.filteredContacts" :key="contact.id">
            <td data-label="">
              <div class="contact-avatar">
                <img
                  :src="getContactPhotoUrl(contact)"
                  :alt="contact.nombre"
                />
              </div>
            </td>
            <td data-label="Nombre">
              <span class="contact-name">{{ contact.nombre }}</span>
            </td>
            <td data-label="Teléfono">
              <span class="contact-phone">
                <i class="fa-solid fa-phone"></i>
                {{ contact.telefono }}
              </span>
            </td>
            <td data-label="Email">
              <span class="contact-email">
                <i class="fa-solid fa-envelope"></i>
                {{ contact.email }}
              </span>
            </td>
            <td data-label="">
              <div class="contact-actions">
                <RouterLink
                  v-if="contact.id"
                  :to="{ name: 'editar', params: { id: contact.id } }"
                  class="btn-action btn-edit"
                  title="Editar"
                >
                  <i class="fa-solid fa-pen"></i>
                </RouterLink>
                <button
                  class="btn-action btn-delete"
                  title="Eliminar"
                  @click="askDelete(contact)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación -->
    <DeleteModal
      :visible="showDeleteModal"
      :nombre-contacto="contactToDelete?.nombre || ''"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
