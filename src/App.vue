<template>
  <div id="app">
    <router-view />
    <BottomNavbar />
  </div>
</template>

<script>
import BottomNavbar from '@/components/BottomNavbar.vue'

export default {
  name: 'App',
  components: {
    BottomNavbar
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
  padding-bottom: 60px; /* Aggiungi spazio per la navbar */
}
</style>
