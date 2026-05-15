<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import DeleteModal from '@/components/DeleteModal.vue'

const store = useContactStore()
const route = useRoute()

const localSearch = ref('')
const contactToDelete = ref(null)
const showDeleteModal = ref(false)

/* Tomar query param si viene del header */
onMounted(() => {
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

/* Delete flow */
function askDelete(contact) {
  contactToDelete.value = contact
  showDeleteModal.value = true
}

function confirmDelete() {
  if (contactToDelete.value) {
    store.deleteContact(contactToDelete.value.id)
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
    <!-- Header -->
    <div class="contacts-header">
      <h2 class="contacts-title">
        <i class="fa-solid fa-users"></i>
        Mis Contactos
      </h2>
      <RouterLink to="/crear" class="btn-new-contact" id="btn-nuevo-contacto">
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

    <!-- Estado vacío -->
    <div v-if="store.filteredContacts.length === 0" class="contacts-empty" id="empty-state">
      <i class="fa-solid fa-user-slash" style="font-size: 3rem; color: #55AAFF;"></i>
      <p v-if="store.searchQuery">No se encontraron contactos para "{{ store.searchQuery }}".</p>
      <p v-else>Aún no tienes contactos. ¡Agrega el primero!</p>
      <br />
      <RouterLink to="/crear" class="btn-new-contact">
        <i class="fa-solid fa-user-plus"></i>
        <span>Agregar Contacto</span>
      </RouterLink>
    </div>

    <!-- Tabla de contactos (desktop = tabla, mobile = cards vía CSS) -->
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
                  :src="contact.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.nombre)}&background=0044FF&color=fff&size=52`"
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
