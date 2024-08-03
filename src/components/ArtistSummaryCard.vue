<template>
  <div class="artist-card">
    <div class="image-container">
      <img :src="artist.photo" :alt="artist.name" class="artist-photo">
    </div>
    <div class="info-container">
      <span class="artist-name">{{ artist.name }}</span>
      <span class="track-count">{{ artist.trackCount }} brani</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArtistCard',
  props: {
    artist: {
      type: Object,
      required: true,
      validator: (obj) => {
        return obj.photo && obj.name && obj.trackCount !== undefined
      }
    }
  }
}
</script>

<style scoped>
.artist-card {
  width: 200px;
  max-width: 100%;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.artist-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px;
  min-height: 80px;
  background-color: #f0f0f0;
  flex-grow: 1;
}

.artist-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 5px;
  text-align: center;
  color: #333;
  font-family: 'Arial', sans-serif;
  width: 100%;
  overflow-wrap: break-word;
}

.track-count {
  font-size: 16px;
  color: #666;
  font-weight: 500;
  text-align: center;
}
</style>
