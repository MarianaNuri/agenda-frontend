<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import ContactForm from '@/components/ContactForm.vue'

const store = useContactStore()
const route = useRoute()
const router = useRouter()

const contacto = computed(() => store.getById(route.params.id))

function handleUpdate(data) {
  store.updateContact(route.params.id, data)
  router.push('/agenda')
}
</script>

<template>
  <div v-if="!contacto" class="contacts-container">
    <div class="contacts-empty">
      <i class="fa-solid fa-user-slash" style="font-size: 3rem; color: #55AAFF;"></i>
      <p>Contacto no encontrado.</p>
    </div>
  </div>

  <ContactForm
    v-else
    titulo="Editar Contacto"
    texto-boton="Actualizar"
    :contacto-inicial="contacto"
    @submit="handleUpdate"
  />
</template>
