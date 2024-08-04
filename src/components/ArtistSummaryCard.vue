<template>
  <div class="artist-card">
    <div class="image-container">
      <img :src="artist.photo" :alt="artist.name" class="artist-photo">
    </div>
    <div class="info-container">
      <span class="artist-name">{{ artist.name }}</span>
      <span class="track-count">{{ artist.trackCount }}</span>
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
  width: 100%;
  height: 350px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.image-container {
  width: 100%;
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}

.artist-photo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-container {
  padding: 10px;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.artist-name {
  font-weight: bold;
  font-size: 38px;
  display: block;
}

.track-count {
  font-weight: bold;
  font-size: 30px;
  color: #1e8a1c;
}
</style>
