<template>
    <div class="home-view">
        <h2>Bienvenue sur MaPinte !</h2>
        <p>Découvrez et partagez les meilleurs prix de pintes autour de vous.</p>
        <router-link to="/map">Voir la carte</router-link>

        <div class="bar-list-section">
            <div class="bar-list-controls">
                <label for="sort">Trier par :</label>
                <select id="sort" v-model="sortBy">
                    <option value="distance">Distance</option>
                    <option value="price">Prix</option>
                </select>
            </div>
            <ul class="bar-list">
                <li v-for="bar in paginatedBars" :key="bar.lat + '-' + bar.lng">
                    <div class="bar-info">
                        <b>{{ bar.name }}</b>
                        <span class="bar-price">{{ bar.price.toFixed(2) }} €</span>
                        <span v-if="bar.distance !== undefined" class="bar-distance">{{ bar.distance.toFixed(1) }}
                            km</span>
                        <span class="bar-user">Ajouté par : {{ bar.user || 'inconnu' }}</span>
                    </div>
                </li>
            </ul>
            <div class="pagination">
                <button @click="prevPage" :disabled="page === 1">Précédent</button>
                <span>Page {{ page }} / {{ totalPages }}</span>
                <button @click="nextPage" :disabled="page === totalPages">Suivant</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const bars = ref([])
const sortBy = ref('distance')
const page = ref(1)
const pageSize = 5
const userPosition = ref({ lat: null, lng: null })

const API_URL = 'http://localhost:3001/api/bars'

function getDistance(lat1, lng1, lat2, lng2) {
    if (lat1 == null || lng1 == null) return 99999
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

const sortedBars = computed(() => {
    if (sortBy.value === 'price') {
        return [...bars.value].sort((a, b) => a.price - b.price)
    } else {
        return [...bars.value].sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999))
    }
})

const totalPages = computed(() => Math.ceil(sortedBars.value.length / pageSize))
const paginatedBars = computed(() => {
    const start = (page.value - 1) * pageSize
    return sortedBars.value.slice(start, start + pageSize)
})

function prevPage() {
    if (page.value > 1) page.value--
}
function nextPage() {
    if (page.value < totalPages.value) page.value++
}

async function fetchBars() {
    const res = await axios.get(API_URL)
    bars.value = res.data.map(bar => {
        if (userPosition.value.lat && userPosition.value.lng) {
            return {
                ...bar,
                distance: getDistance(userPosition.value.lat, userPosition.value.lng, bar.lat, bar.lng)
            }
        }
        return bar
    })
}

function updateDistances() {
    bars.value = bars.value.map(bar => {
        if (userPosition.value.lat && userPosition.value.lng) {
            return {
                ...bar,
                distance: getDistance(userPosition.value.lat, userPosition.value.lng, bar.lat, bar.lng)
            }
        }
        return bar
    })
}

onMounted(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userPosition.value.lat = pos.coords.latitude
            userPosition.value.lng = pos.coords.longitude
            fetchBars()
        }, fetchBars)
    } else {
        fetchBars()
    }
})

watch(sortBy, () => {
    page.value = 1
    if (sortBy.value === 'distance') updateDistances()
})
</script>

<style scoped>
.home-view {
    text-align: center;
    margin-top: 2rem;
}

.bar-list-section {
    margin-top: 2rem;
    background: #232323;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 8px #0002;
}

.bar-list-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.bar-list-controls select {
    background: #222;
    color: #ffd700;
    border: 1px solid #ffd700;
    border-radius: 8px;
    padding: 0.4rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    margin-left: 0.5rem;
    outline: none;
    transition: border 0.2s, color 0.2s;
}

.bar-list-controls select:focus {
    border: 1.5px solid #42b983;
    color: #fff;
}

.bar-list-controls label {
    color: #fff;
    font-weight: 500;
}

.bar-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.bar-list li {
    padding: 0.7rem 0.5rem;
    border-bottom: 1px solid #333;
}

.bar-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.bar-price {
    color: #ffd700;
    font-weight: bold;
}

.bar-distance {
    color: #42b983;
    font-size: 0.95em;
}

.bar-user {
    color: #aaa;
    font-size: 0.9em;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}

.pagination button {
    background: #ffd700;
    color: #222;
    border: none;
    border-radius: 8px;
    padding: 0.4rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.pagination button:disabled {
    background: #444;
    color: #fff;
    cursor: not-allowed;
}
</style>
