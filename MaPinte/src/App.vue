<script setup>
// Suppression des imports inutiles
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    <h1>MaPinte</h1>
    <nav>
      <router-link to="/">Accueil</router-link> |
      <router-link to="/map">Carte</router-link>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  background: #222;
  color: #fff;
  padding: 1.5rem 0 1rem 0;
  border-bottom: 1px solid #333;
}

.logo {
  display: block;
  margin: 0 auto 1.2rem;
  filter: brightness(0) invert(1);
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

nav {
  text-align: center;
  margin-bottom: 1rem;
}

nav a {
  margin: 0 0.7rem;
  text-decoration: none;
  color: #fff;

  font-size: 1.1rem;
  font-weight: 500;
  transition: color 0.2s;
}

nav a.router-link-exact-active {
  font-weight: bold;
  text-decoration: underline;
  color: #ffd700;
}

main {
  padding: 1.2rem 0.7rem 0 0.7rem;
  min-height: 80vh;
  background: #181818;
  color: #fff;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

body {
  background: #181818;
  color: #fff;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  margin: 0;
  padding: 0;
}
</style>
