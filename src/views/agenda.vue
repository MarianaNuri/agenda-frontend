<script setup>

// Se importan las herramientas necesarias para mostrar la lista de contactos y manejar la navegación
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/config/api'
// Se importa el componente de confirmación para eliminar contactos
import DeleteModal from '@/components/DeleteModal.vue'

// Se conecta con el almacén de contactos, autenticación y la ruta actual
const store = useContactStore()
const auth = useAuthStore()
const route = useRoute()

// Variables para la búsqueda y el proceso de eliminación de contactos
const localSearch = ref('')
const contactToDelete = ref(null)
const showDeleteModal = ref(false)
//const photoBaseUrl = ref('')

/* Cargar contactos del backend al montar */
// Cuando la página se abre, se traen todos los contactos del usuario desde el servidor
onMounted(async () => {
  // Cargar contactos
  await store.fetchContacts()
  //para verificar que datos llegan
  console.log(store.filteredContacts)

  // Tomar query param si viene del header
  // Si el usuario llegó desde la barra de búsqueda del encabezado, se aplica el filtro automáticamente
  if (route.query.q) {
    localSearch.value = route.query.q
    store.setSearch(route.query.q)
  }
})

// Aplica el filtro de búsqueda para encontrar contactos por nombre, email o teléfono
function handleSearch() {
  store.setSearch(localSearch.value)
}

// Limpia el filtro de búsqueda y vuelve a mostrar todos los contactos
function clearSearch() {
  localSearch.value = ''
  store.setSearch('')
}

/**
 * Construye la URL de la foto de un contacto usando el helper de Pinia.
 * Si no tiene foto (es NULL o vacío), usa ui-avatars como respaldo.
 */
// Obtiene la foto del contacto; si no tiene foto subida, genera un avatar con las iniciales del nombre
function getContactPhotoUrl(contact) {
  if (contact && contact.foto && contact.foto !== 'NULL') {
    // USAMOS TU FUNCIÓN DEL STORE 
    return store.buildPhotoUrl(contact.foto)
  }
  // Respaldo con iniciales si el campo en la BD es NULL
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.nombre)}&background=0044FF&color=fff&size=52`
}

  
/* Delete flow */
// Abre la ventana de confirmación antes de eliminar un contacto
function askDelete(contact) {
  contactToDelete.value = contact
  showDeleteModal.value = true
}

// Se ejecuta cuando el usuario confirma que sí quiere eliminar el contacto
async function confirmDelete() {
  if (contactToDelete.value) {
    await store.deleteContact(contactToDelete.value.id)
  }
  showDeleteModal.value = false
  contactToDelete.value = null
}

// Se ejecuta cuando el usuario cancela la eliminación del contacto
function cancelDelete() {
  showDeleteModal.value = false
  contactToDelete.value = null
}
</script>

<template>
  <div class="contacts-container" id="agenda-view">
    <!-- Mensajes de feedback -->
    <!-- Muestra mensajes de éxito o error después de crear, editar o eliminar un contacto -->
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
    <!-- Encabezado con el título "Mis Contactos" y el botón para agregar un nuevo contacto -->
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
    <!-- Barra de búsqueda que permite filtrar contactos en tiempo real por nombre, email o teléfono -->
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
    <!-- Se muestra una animación de carga mientras se obtienen los contactos del servidor -->
    <div v-if="store.loading" class="contacts-empty" id="loading-state">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: #55AAFF;"></i>
      <p>Cargando contactos...</p>
    </div>

    <!-- Estado vacío -->
    <!-- Si el usuario no tiene contactos o la búsqueda no encontró resultados, se muestra un mensaje amigable -->
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
    <!-- Tabla donde se muestran todos los contactos del usuario con su foto, nombre, teléfono, email y acciones -->
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
          <!-- Se recorre la lista de contactos filtrados y se muestra cada uno como una fila -->
          <tr v-for="contact in store.filteredContacts" :key="contact.id">
            <!-- Foto del contacto o avatar con iniciales si no tiene foto -->
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
            <!-- Botones de acción: editar lleva al formulario de edición, eliminar abre la confirmación -->
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
    <!-- Ventana emergente que pide confirmación antes de eliminar un contacto definitivamente -->
    <DeleteModal
      :visible="showDeleteModal"
      :nombre-contacto="contactToDelete?.nombre || ''"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

