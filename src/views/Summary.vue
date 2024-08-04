<template>
  <div class="artist-grid">
    <div v-for="artist in artists" :key="artist.id" class="grid-item">
      <ArtistCard :artist="artist" />
    </div>
  </div>
</template>

<script>
import ArtistCard from '@/components/ArtistSummaryCard.vue'

export default {
  name: 'ArtistSummary',
  components: {
    ArtistCard
  },
  data() {
    return {
      artists: [
        {
          id: 1,
          name: 'Eminem',
          photo: 'https://www.nme.com/wp-content/uploads/2022/05/Eminem-2002.jpg',
          trackCount: 10
        },
        {
          id: 2,
          name: '50 Cent',
          photo: 'https://i.scdn.co/image/dd031b9c5d1b6eba4a691cd89c954255aae787f2',
          trackCount: 15
        },
        {
          id: 3,
          name: 'Dr. Dre',
          photo: 'https://hips.hearstapps.com/hmg-prod/images/dr_dre_photo_by_christopher_pol_getty_images_entertainment_getty_120919208.jpg?resize=1200:*',
          trackCount: 20
        },
        {
          id: 4,
          name: 'Snoop Dogg',
          photo: 'https://www.nme.com/wp-content/uploads/2022/05/Snoop-Dogg-2022.jpg',
          trackCount: 25
        },
        {
          id: 5,
          name: 'Kendrick Lamar',
          photo: 'https://www.nme.com/wp-content/uploads/2022/05/Kendrick-Lamar-2022.jpg',
          trackCount: 30
        },
        {
          id: 7,
          name: 'Jay-Z',
          photo: 'https://www.nme.com/wp-content/uploads/2022/05/Jay-Z-2022.jpg',
          trackCount: 40
        },
        {
          id: 8,
          name: 'Kanye West',
          photo: 'https://www.nme.com/wp-content/uploads/2022/05/Kanye-West-2022.jpg',
          trackCount: 45
        },
        {
          id: 9,
          name: 'Lil Wayne',
          photo: 'https://www.nme.com/wp-content/uploads/2022/05/Lil-Wayne-2022.jpg',
          trackCount: 50
        },
        {
          id: 10,
          name: 'Nicki Minaj',
          photo: 'https://www.nme.com/wp-content/uploads/2022/05/Nicki-Minaj-2022.jpg',
          trackCount: 55
        }
      ]
    }
  }
}
</script>

<style scoped>
.artist-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  padding: 20px;
}

.grid-item {
  width: 100%;
}

.artist-grid > * {
  flex-basis: calc(20% - 16px);
  margin-bottom: 30px;
}

.artist-grid::after {
  content: "";
  flex: auto;
}
</style>
