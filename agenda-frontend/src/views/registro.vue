<script setup>
</script>

<template>
  <div class="card" style="margin: 2rem auto;">
    <h2>Registro</h2>

    <form @submit.prevent>
      <div class="form-group">
        <label for="reg-nombre">Nombre</label>
        <input type="text" id="reg-nombre" placeholder="Tu nombre" />
      </div>
      <div class="form-group">
        <label for="reg-email">Email</label>
        <input type="email" id="reg-email" placeholder="correo@ejemplo.com" />
      </div>
      <div class="form-group">
        <label for="reg-password">Contraseña</label>
        <input type="text" id="reg-password" placeholder="Crea una contraseña" />
      </div>
      <button type="submit" class="btn-submit">
        <span>Registrarse</span>
      </button>
    </form>

    <RouterLink to="/login" class="back-link">
      <span class="arrow">&larr;</span>
      ¿Ya tienes cuenta? Inicia sesión
    </RouterLink>
  </div>
</template>
