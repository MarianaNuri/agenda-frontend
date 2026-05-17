<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppFooter from './components/AppFooter.vue'

const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <AppHeader @toggle-sidebar="toggleSidebar" />
  <AppSidebar :is-open="sidebarOpen" @close="closeSidebar" />

  <main>
    <RouterView v-slot="{ Component }">
      <Transition name="slide-up" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <AppFooter />
</template>

<style scoped>
main {
  flex: 1;
}
</style>
