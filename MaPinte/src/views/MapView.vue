<template>
    <div class="map-view">
        <h2>Carte des prix des pintes</h2>
        <form class="search-bar" @submit.prevent="searchAddress">
            <input v-model="search" type="text" placeholder="Rechercher une adresse ou un bar..." />
            <button type="submit">🔍</button>
        </form>
        <button class="locate-btn" @click="goToMyPosition">📍 Ma position</button>
        <div id="map" class="map-placeholder"></div>
        <p>Partagez le prix d'une pinte en cliquant sur la carte !</p>
        <div v-if="showForm" class="modal-form">
            <form @submit.prevent="addBar">
                <h3>Ajouter un bar</h3>
                <input v-model="barName" type="text" placeholder="Nom du bar" required />
                <input v-model="beerPrice" type="number" min="0" step="0.01" placeholder="Prix de la pinte (€)"
                    required />
                <div class="form-actions">
                    <button type="submit">Ajouter</button>
                    <button type="button" @click="closeForm">Annuler</button>
                </div>
            </form>
        </div>
        <div v-if="showUserModal" class="modal-form">
            <form @submit.prevent="saveUser">
                <h3>Bienvenue sur MaPinte !</h3>
                <input v-model="currentUser" type="text" placeholder="Votre pseudo" required />
                <div class="form-actions">
                    <button type="submit">Valider</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

const search = ref('')
let map
const showForm = ref(false)
const barName = ref('')
const beerPrice = ref('')
let clickedLatLng = null
const bars = ref([])
const API_URL = 'http://localhost:3001/api/bars'
const users = ref([])
const currentUser = ref('')
const showUserModal = ref(false)

function searchAddress() {
    if (!search.value) return
    // Utilisation de l'API Nominatim d'OpenStreetMap pour la géocodage
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search.value)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                const { lat, lon } = data[0]
                map.setView([lat, lon], 16)
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(search.value).openPopup()
            }
        })
}

function closeForm() {
    showForm.value = false
    barName.value = ''
    beerPrice.value = ''
    clickedLatLng = null
}

function saveUser() {
    if (currentUser.value.trim()) {
        localStorage.setItem('mapinte_user', currentUser.value.trim())
        showUserModal.value = false
    }
}

onMounted(() => {
    map = L.map('map').setView([48.8566, 2.3522], 13) // Paris par défaut
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // Vérifie si un utilisateur est déjà enregistré
    const user = localStorage.getItem('mapinte_user')
    if (!user) {
        showUserModal.value = true
    } else {
        currentUser.value = user
    }

    loadBars()

    map.on('click', function (e) {
        clickedLatLng = e.latlng
        showForm.value = true
    })
})

async function addBar() {
    if (!barName.value || !beerPrice.value || !clickedLatLng || !currentUser.value) return
    const bar = {
        name: barName.value,
        price: parseFloat(beerPrice.value),
        lat: clickedLatLng.lat,
        lng: clickedLatLng.lng,
        user: currentUser.value
    }
    try {
        await axios.post(API_URL, bar)
        bars.value.push(bar)
        L.marker([bar.lat, bar.lng]).addTo(map)
            .bindPopup(`<b>${bar.name}</b><br/>Pinte : ${bar.price.toFixed(2)} €<br/><i>Ajouté par : ${bar.user}</i>`).openPopup()
        closeForm()
    } catch (e) {
        alert('Erreur lors de l\'enregistrement du bar !')
    }
}

async function loadBars() {
    try {
        const res = await axios.get(API_URL)
        bars.value = res.data
        bars.value.forEach(bar => {
            L.marker([bar.lat, bar.lng]).addTo(map)
                .bindPopup(`<b>${bar.name}</b><br/>Pinte : ${bar.price.toFixed(2)} €<br/><i>Ajouté par : ${bar.user || 'inconnu'}</i>`)
        })
    } catch (e) {
        // fallback localStorage si le serveur n'est pas dispo
        const data = localStorage.getItem('bars')
        if (data) {
            bars.value = JSON.parse(data)
            bars.value.forEach(bar => {
                L.marker([bar.lat, bar.lng]).addTo(map)
                    .bindPopup(`<b>${bar.name}</b><br/>Pinte : ${bar.price.toFixed(2)} €<br/><i>Ajouté par : ${bar.user || 'inconnu'}</i>`)
            })
        }
    }
}

function goToMyPosition() {
    if (!navigator.geolocation) {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 16);
            L.marker([latitude, longitude]).addTo(map)
                .bindPopup('Vous êtes ici !').openPopup();
        },
        () => {
            alert('Impossible de récupérer votre position.');
        }
    );
}
</script>

<style scoped>
.map-view {
    text-align: center;
    margin-top: 2rem;
}

.search-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    gap: 0.5rem;
}

.search-bar input {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    border: none;
    width: 70vw;
    max-width: 350px;
    font-size: 1rem;
    background: #222;
    color: #fff;
}

.search-bar button {
    background: #ffd700;
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.search-bar button:hover {
    background: #fff;
    color: #222;
}

#map.map-placeholder {
    width: 100%;
    height: 300px;
    background: #e0e0e0;
    margin-bottom: 1rem;
    border-radius: 8px;
}

.modal-form {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-form form {
    background: #222;
    padding: 2rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 2px 16px #000a;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 250px;
    max-width: 90vw;
}

.modal-form input {
    padding: 0.7rem 1rem;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    background: #181818;
    color: #fff;
}

.user-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.user-modal-content {
    background: #222;
    padding: 2rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 2px 16px #000a;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 250px;
    max-width: 90vw;
}

.user-modal input {
    padding: 0.7rem 1rem;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    background: #181818;
    color: #fff;
}

.user-modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.user-modal-actions button {
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    background: #ffd700;
    color: #222;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.user-modal-actions button:hover {
    background: #fff;
    color: #222;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.form-actions button {
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    background: #ffd700;
    color: #222;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.form-actions button[type="button"] {
    background: #444;
    color: #fff;
}

.form-actions button:hover {
    background: #fff;
    color: #222;
}

.locate-btn {
    display: inline-block;
    margin-bottom: 1rem;
    background: #ffd700;
    color: #222;
    border: none;
    border-radius: 20px;
    padding: 0.5rem 1.2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px #0002;
    transition: background 0.2s;
}

.locate-btn:hover {
    background: #fff;
    color: #222;
}
</style>
