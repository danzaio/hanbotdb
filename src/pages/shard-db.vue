<script setup>
import {computed, ref} from 'vue'
import {changeLanguage, language, L} from '@/components/language'
import {fetchData, isDaily, shardStat} from "@/components/shards-data"
import StatDialog from "@/components/statDialog.vue";

let dataSourceLabel = computed(() => isDaily.value ? L('DAILY') : L('GAME PATCH'))
let searchKeywords = ref("")
let selectedStat = ref(null)
let highlightShard = ref("")

function changeDataSource(){
  isDaily.value = !isDaily.value
  fetchData()
}

function searchFilter(shard) {
  const keywords = [shard.name.toLowerCase()]
  const searched = [searchKeywords.value.toLowerCase()]

  if (searched.length === 0) {
    return true
  }

  for (const search of searched) {
    if (keywords.some(e => e.indexOf(search) !== -1)) {
      return true;
    }
  }

  return false
}
</script>

<template>
  <div class="page-wrapper">
    <!-- Particles Background -->
    <div class="particles-bg">
      <div class="particle" style="width: 4px; height: 4px; background: var(--accent-blue); top: 20%; left: 10%; animation-delay: 0s;"></div>
      <div class="particle" style="width: 6px; height: 6px; background: var(--gold-primary); top: 60%; right: 15%; animation-delay: 2s;"></div>
      <div class="particle" style="width: 3px; height: 3px; background: var(--accent-blue); bottom: 30%; left: 20%; animation-delay: 4s;"></div>
      <div class="particle" style="width: 5px; height: 5px; background: var(--gold-bright); top: 40%; right: 30%; animation-delay: 1s;"></div>
    </div>

    <header class="glass magic-header">
      <div class="header-inner">
        <div class="logo-section">
          <h1 class="text-gradient" @click="searchKeywords = ''">{{ L('Shard DB') }}</h1>
          <span class="version-badge">
            <span class="version-dot"></span>
            v2.0
          </span>
        </div>
        
        <nav class="nav-actions">
          <button class="magic-btn" @click="changeDataSource">
            {{ dataSourceLabel }}
          </button>
          <button class="magic-btn" @click="changeLanguage">
            {{ language }}
          </button>
          <button class="magic-btn primary" @click="$router.push({name: 'champion-db'})">
            {{ L('Champion View') }}
          </button>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="search-container">
        <div class="search-wrapper">
          <input 
            class="magic-input search-input" 
            v-model="searchKeywords" 
            :placeholder="L('Search for a shard category...')"
          />
        </div>
      </div>

      <div class="content-area">
        <!-- Categories View (when no search) -->
        <div v-if="searchKeywords.trim().length === 0" class="categories-grid">
          <div 
            v-for="shard in shardStat" 
            :key="'shard_' + shard.name"
            class="magic-card category-card"
            @click="searchKeywords = shard.name"
          >
            <h3 class="category-title">{{ shard.name }}</h3>
            <div class="category-stats">
              <span>{{ shard.support ? shard.support.length : 0 }} Champions</span>
            </div>
          </div>
        </div>

        <!-- Detailed View -->
        <div v-else class="results-container">
          <template v-for="shard in shardStat" :key="'shard_' + shard.name">
            <div v-if="searchFilter(shard)" class="shard-section">
              <div class="section-header">
                <h2 class="text-gradient">{{ shard.name }}</h2>
                <button class="back-btn" @click="searchKeywords = ''">✕ Clear</button>
              </div>
              
              <div class="champions-grid">
                <div 
                  v-for="stat in shard.support" 
                  :key="'shard_' + shard.name + '_' + stat.champion.alias"
                  class="magic-card champion-card"
                  @click="selectedStat = stat; highlightShard=shard.name;"
                >
                  <div class="champion-image-wrapper">
                    <img 
                      :src="'//game.gtimg.cn/images/lol/act/img/champion/' + stat.champion.alias + '.png'"
                      :alt="stat.champion.alias"
                      loading="lazy"
                    >
                  </div>
                  <div class="champion-info">
                    <p class="champion-name">{{ language === 'CN' ? stat.champion.name : stat.champion.alias }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>

    <stat-dialog 
      v-if="selectedStat" 
      :data="selectedStat" 
      :highlight="highlightShard" 
      @close="selectedStat = null"
    />
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  padding-top: 90px;
}

.magic-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-section h1 {
  font-size: 1.8rem;
  margin: 0;
  cursor: pointer;
}

.version-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 999px;
  font-size: 0.75rem;
  color: #6ee7b7;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.version-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.search-container {
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
}

.search-wrapper {
  width: 100%;
  max-width: 500px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.category-card {
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 160px;
}

.category-title {
  margin: 0;
  font-size: 1.4rem;
  font-family: var(--font-title);
  color: var(--gold-highlight);
}

.category-stats {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-gold);
}

.section-header h2 {
  margin: 0;
  font-size: 2.5rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  font-family: var(--font-title);
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--gold-primary);
}

.champions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1.5rem;
}

.champion-card {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(7, 13, 24, 0.6);
}

.champion-image-wrapper {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid var(--border-gold);
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.champion-card:hover .champion-image-wrapper {
  border-color: var(--accent-blue);
  box-shadow: 0 0 15px var(--accent-glow);
  transform: scale(1.05);
}

.champion-image-wrapper img {
  width: 110%;
  height: 110%;
  object-fit: cover;
  margin-left: -5%;
  margin-top: -5%;
}

.champion-info {
  margin-top: 1rem;
  text-align: center;
}

.champion-name {
  margin: 0;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s;
}

.champion-card:hover .champion-name {
  color: var(--gold-highlight);
}

@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-wrapper {
    padding-top: 160px;
  }
  
  .champions-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
