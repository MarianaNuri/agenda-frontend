<script setup>
</script>

<template>
  <div class="card" style="margin: 2rem auto;">
    <h2>Iniciar Sesión</h2>

    <form @submit.prevent>
      <div class="form-group">
        <label for="login-email">Email</label>
        <input type="email" id="login-email" placeholder="correo@ejemplo.com" />
      </div>
      <div class="form-group">
        <label for="login-password">Contraseña</label>
        <input type="text" id="login-password" placeholder="Tu contraseña" />
      </div>
      <button type="submit" class="btn-submit">
        <span>Entrar</span>
      </button>
    </form>

    <RouterLink to="/registro" class="back-link">
      <span class="arrow">&rarr;</span>
      ¿No tienes cuenta? Regístrate
    </RouterLink>
  </div>
</template>
