<template>
  <div class="login-container">
    <div class="login-box">
      <button v-if="!loggedIn" @click="login" class="login-button">Accedi con Spotify</button>
      <div class="status-message">
        <p v-if="loggedIn">Sei loggato come {{ user }}</p>
        <p v-else>Non sei loggato</p>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'Login',
  data() {
    return {
      loggedIn: false,
      user: null
    }
  },
  created() {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      this.loggedIn = true

      fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then((response) => response.json())
        .then((data) => {
          this.user = data.display_name
        })
        .catch((error) => {
          console.error('Errore:', error)
        })
    } else {
      this.loggedIn = false
    }
  },
  methods: {
    login() {
      const clientId = import.meta.env.VITE_CLIENT_ID
      const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URL)
      const scopes = encodeURIComponent(import.meta.env.VITE_SCOPES)
      const state = uuidv4()

      if (!clientId || !redirectUri || !scopes) {
        console.error('Client ID, redirect URI and scopes are required')
        return
      }

      window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  text-align: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.login-button {
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #1db954;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #1ed760;
}

.status-message {
  margin-top: 20px;
  font-size: 18px;
}
</style>
