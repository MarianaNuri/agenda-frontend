<template>
  <div class="ver-contacto-page">
    <div class="card card-detail" v-if="contact">
      <h2>Detalle del Contacto</h2>

      <!-- Foto arriba -->
      <div class="detail-photo">
        <img :src="getContactPhotoUrl(contact)" :alt="'Foto de ' + contact.nombre">
      </div>

      <!-- Nombre completo -->
      <p class="detail-name">
        {{ contact.nombre }} {{ contact.apellido || '' }}
      </p>

      <!-- Información del contacto -->
      <div class="detail-info">
        <div class="detail-row" v-if="contact.telefono">
          <i class="fa-solid fa-phone"></i>
          <div>
            <span class="detail-label">Teléfono</span>
            <span class="detail-value">{{ contact.telefono }}</span>
          </div>
        </div>
        
        <div class="detail-row" v-if="contact.email">
          <i class="fa-solid fa-envelope"></i>
          <div>
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ contact.email }}</span>
          </div>
        </div>
        
        <div class="detail-row" v-if="contact.direccion">
          <i class="fa-solid fa-location-dot"></i>
          <div>
            <span class="detail-label">Dirección</span>
            <span class="detail-value">{{ contact.direccion }}</span>
          </div>
        </div>
        
        <div class="detail-row" v-if="contact.notas">
          <i class="fa-solid fa-note-sticky"></i>
          <div>
            <span class="detail-label">Notas</span>
            <span class="detail-value">{{ contact.notas }}</span>
          </div>
        </div>
      </div>

      <RouterLink to="/agenda" class="back-link">
        <span class="arrow">←</span> Volver a la agenda
      </RouterLink>
    </div>
    
    <!-- Animación de carga -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando detalles...</p>
    </div>
    
    <!-- Error -->
    <div v-else class="error-state">
      <p>No se pudo cargar el contacto.</p>
      <RouterLink to="/agenda" class="btn-submit" style="width: auto; padding: 0.5rem 1rem; margin-top: 1rem;">
        Volver a la agenda
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'

const route = useRoute()
const router = useRouter()
const store = useContactStore()

const contact = ref(null)
const loading = ref(true)

// Función para obtener la URL de la foto usando la misma lógica que agenda.vue
function getContactPhotoUrl(c) {
  if (c && c.foto && c.foto !== 'NULL') {
    return store.buildPhotoUrl(c.foto)
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(c?.nombre || 'User')}&background=0044FF&color=fff&size=130`
}

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    router.push('/agenda')
    return
  }

  // Obtenemos el contacto desde el store/API
  const fetchedContact = await store.getById(id)
  if (fetchedContact) {
    contact.value = fetchedContact
  }
  loading.value = false
})
</script>

<style scoped>
.ver-contacto-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  width: 100%;
}

.loading-state, .error-state {
  text-align: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
