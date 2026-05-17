<script setup>
/**
 * views/EditarContacto.vue
 *
 * Vista para editar un contacto existente.
 * Carga el contacto del backend si no está en el store local.
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import ContactForm from '@/components/ContactForm.vue'

const store = useContactStore()
const route = useRoute()
const router = useRouter()

const contacto = ref(null)
const loadingContact = ref(true)

/* Cargar contacto al montar */
onMounted(async () => {
  loadingContact.value = true
  contacto.value = await store.getById(route.params.id)
  loadingContact.value = false
})

async function handleUpdate(data) {
  const success = await store.updateContact(route.params.id, data)
  if (success) {
    router.push('/agenda')
  }
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loadingContact" class="contacts-container">
    <div class="contacts-empty">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: #55AAFF;"></i>
      <p>Cargando contacto...</p>
    </div>
  </div>

  <!-- Contacto no encontrado -->
  <div v-else-if="!contacto" class="contacts-container">
    <div class="contacts-empty">
      <i class="fa-solid fa-user-slash" style="font-size: 3rem; color: #55AAFF;"></i>
      <p>Contacto no encontrado.</p>
    </div>
  </div>

  <!-- Formulario de edición -->
  <ContactForm
    v-else
    titulo="Editar Contacto"
    texto-boton="Actualizar"
    :contacto-inicial="contacto"
    :loading="store.loading"
    :error="store.error"
    :success-message="store.successMessage"
    @submit="handleUpdate"
  />
</template>
