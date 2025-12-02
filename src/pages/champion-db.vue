<script setup>
import {computed, ref} from 'vue'
import {language, changeLanguage, L} from '@/components/language'
import {isDaily, heroStat, fetchData} from "@/components/shards-data"
import StatDialog from "@/components/statDialog.vue";
import AnalyticsCharts from "@/components/AnalyticsCharts.vue";

let dataSourceLabel = computed(() => isDaily.value ? L('DAILY') : L('GAME PATCH'))
let searchKeywords = ref("")
let selectedStat = ref(null)
let selectedRole = ref('ALL')
let sortBy = ref('PICK_RATE')

const roles = ['ALL', 'FIGHTER', 'TANK', 'MAGE', 'ASSASSIN', 'SUPPORT', 'MARKSMAN']

function changeDataSource(){
  isDaily.value = !isDaily.value
  fetchData()
}

const filteredChampions = computed(() => {
  let result = heroStat.value || []

  // 1. Search Filter
  if (searchKeywords.value.trim()) {
    const searched = searchKeywords.value.toLowerCase().split(' ').filter(e => e.length > 0)
    
    if (searched.length > 0) {
      result = result.filter(stat => {
        const champion = stat.champion
        const keywords = champion.keywords ? champion.keywords.split(',').filter(e => e.length > 0).map(e => e.toLowerCase()) : []
        
        // Check name/alias
        if (champion.name.toLowerCase().includes(searched[0]) || 
            champion.alias.toLowerCase().includes(searched[0])) {
          return true
        }
        
        // Check keywords
        return searched.some(s => keywords.some(k => k.includes(s)))
      })
    }
  }

  // 2. Role Filter
  if (selectedRole.value !== 'ALL') {
    const roleKey = selectedRole.value.toLowerCase()
    result = result.filter(stat => 
      stat.champion.roles && stat.champion.roles.includes(roleKey)
    )
  }

  // 3. Sort
  result = [...result].sort((a, b) => {
    const statA = a.stat || {}
    const statB = b.stat || {}
    
    if (sortBy.value === 'WIN_RATE') {
      return (statB.win_rate || 0) - (statA.win_rate || 0)
    } else {
      // Default to Pick Rate
      return (statB.pick_rate || 0) - (statA.pick_rate || 0)
    }
  })

  return result
})

function getRoleLabel(role) {
  const map = {
    'ALL': 'All Roles',
    'FIGHTER': 'Fighter',
    'TANK': 'Tank',
    'MAGE': 'Mage',
    'ASSASSIN': 'Assassin',
    'SUPPORT': 'Support',
    'MARKSMAN': 'ADC'
  }
  return L(map[role] || role)
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
          <h1 class="text-gradient" @click="searchKeywords = ''">{{ L('Hanbot Database') }}</h1>
        </div>
        
        <nav class="nav-actions">
          <button class="magic-btn" @click="changeDataSource">
            {{ dataSourceLabel }}
          </button>
          <button class="magic-btn" @click="changeLanguage">
            {{ language }}
          </button>
          <button class="magic-btn primary" @click="$router.push({name: 'shard-db'})">
            {{ L('Shard View') }}
          </button>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <!-- Meta Analysis Chart -->
      <AnalyticsCharts />

      <div class="search-container">
        <div class="search-wrapper">
          <input 
            class="magic-input search-input" 
            v-model="searchKeywords" 
            :placeholder="L('Search champions...')"
          />
        </div>
      </div>

      <div class="filters-container glass">
        <div class="role-filters">
          <button 
            v-for="role in roles" 
            :key="role"
            :class="['filter-btn', { active: selectedRole === role }]"
            @click="selectedRole = role"
          >
            {{ getRoleLabel(role) }}
          </button>
        </div>
        
        <div class="sort-filter">
          <select v-model="sortBy" class="magic-select">
            <option value="PICK_RATE">{{ L('Sort by Pick Rate') }}</option>
            <option value="WIN_RATE">{{ L('Sort by Win Rate') }}</option>
          </select>
        </div>
      </div>

      <div class="content-area">
        <div class="champions-grid">
          <template v-for="stat in filteredChampions" :key="'hero_' + stat.champion.alias">
            <div 
              class="magic-card champion-card" 
              @click="selectedStat = stat" 
            >
              <div class="champion-image-wrapper">
                <img 
                  :src="'//game.gtimg.cn/images/lol/act/img/champion/' + stat.champion.alias + '.png'"
                  :alt="language === 'CN' ? stat.champion.name : stat.champion.alias"
                  loading="lazy"
                >
              </div>
              <div class="champion-info">
                <p class="champion-name">{{ language === 'CN' ? stat.champion.name : stat.champion.alias }}</p>
                <div class="champion-stats-mini">
                  <span class="stat-badge win-rate" v-if="stat.stat && stat.stat.win_rate">
                    {{ (stat.stat.win_rate * 100).toFixed(1) }}% WR
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>

    <stat-dialog v-if="selectedStat" :data="selectedStat" @close="selectedStat = null"/>
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

.logo-section h1 {
  font-size: 1.8rem;
  margin: 0;
  cursor: pointer;
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
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.search-wrapper {
  width: 100%;
  max-width: 500px;
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 1rem;
}

.role-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: var(--font-body);
  font-size: 0.9rem;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border-color: var(--gold-primary);
}

.filter-btn.active {
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.2), rgba(7, 13, 24, 0.8));
  border-color: var(--gold-highlight);
  color: var(--gold-highlight);
  box-shadow: 0 0 10px rgba(200, 170, 110, 0.1);
}

.magic-select {
  background: rgba(7, 13, 24, 0.8);
  border: 1px solid var(--border-gold);
  color: var(--gold-primary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  font-family: var(--font-body);
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
  cursor: pointer;
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
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.champion-stats-mini {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.stat-badge {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
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
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .role-filters {
    justify-content: center;
  }
}
</style>
