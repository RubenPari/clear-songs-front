<template>
  <nav class="bottom-navbar">
    <router-link to="/" class="nav-item">
      <i class="fas fa-home"></i>
      <span>Home</span>
    </router-link>
    <router-link to="/login" class="nav-item">
      <i class="fas fa-user"></i>
      <span>Login</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'BottomNavbar'
}
</script>

<style scoped>
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: #f8f9fa;
  padding: 10px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.nav-item i {
  font-size: 24px;
  margin-bottom: 5px;
}

.nav-item span {
  font-size: 12px;
}
</style>
