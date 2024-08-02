<template>
  <div>Autenticazione in corso...</div>
</template>

<script>
export default {
  name: 'Callback',
  mounted() {
    const hash = this.$route.hash

    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const tokenType = params.get('token_type')
      const expiresIn = params.get('expires_in')
      const state = params.get('state')

      // Gestisci i parametri come necessario
      console.log('Access Token:', accessToken)
      console.log('Token Type:', tokenType)
      console.log('Expires In:', expiresIn)
      console.log('State:', state)

      // salva i parametri in localStorage
      localStorage.setItem('accessToken', accessToken)

      // reindirizza l'utente alla pagina principale
      this.$router.push({ name: 'Login' })
    }
  }
}
</script>
