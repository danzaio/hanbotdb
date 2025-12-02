<script setup>
import {ref} from "vue";
import {language, L} from '@/components/language'

const props = defineProps(['data', 'highlight'])

let pluginList = ref([]);
let sortBy = ref("")
let sortDirection = ref("DESC")

function buildPluginList() {
  pluginList.value = props.data.stat.shards

  pluginList.value.forEach(e => {
    if (!e.pick_rate) e.pick_rate = 0
    if (!e.win_rate) e.win_rate = 0
  })

  pluginList.value.sort((a, b) => {
    if (sortDirection.value === "DESC") {
      return b[sortBy.value] - a[sortBy.value]
    }
    return a[sortBy.value] - b[sortBy.value]
  })
}

function formatPluginName(plugin_id) {
  const pluginNames = {
    "KorniAIOMeow": "Kornis AIO",
    "KiriAIO": "Kiri AIO",
    "Fx": "Fx AIO",
    "archer": "Archer AIO",
    "SA_AIOCN": "SA AIO",
    "hanbot_beasty": "Hanbot Beasty",
    "JUST_AIO": "JUST AIO",
    "intnner_cn": "Int AIO",
    "cno1_aio": "CNo1 AIO",
    "Healer_A.I.O.": "Healer AIO",
    "AlexisAIO": "Alexis AIO",
    "HuangGuanVipAIO": "HuangGuan AIO",
    "Demon_Aio_": "Demon AIO",
    "MasterAio": "Master AIO",
    "Nyx_AIO": "Klee AIO",
  }

  if (pluginNames[plugin_id]) {
    return pluginNames[plugin_id]
  }

  if (plugin_id.includes("[Viktor]")) {
    return "Viktor AIO"
  }

  return plugin_id;
}

function HandleSort(key) {
  sortBy.value = key
  buildPluginList()
}


HandleSort('pick_rate')

</script>

<template>
  <div class="stat-dialog_wrapper" @click.self="$emit('close')">
    <div class="stat-dialog_container">
      <div class="stat-dialog_body glass">
        <button class="stat-dialog_close" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="plugin-stat">
          <div class="dialog-header">
            <div class="header-icon-wrapper">
              <img class="header-icon"
                   :src="'//game.gtimg.cn/images/lol/act/img/champion/' + data.champion.alias + '.png'"
                   :alt="language === 'CN' ? data.champion.name : data.champion.alias">
            </div>
            <h2 class="text-gradient">
              {{ language === "EN" ? data.champion.alias : data.champion.name }}
            </h2>
          </div>
          
          <div class="table-container custom-scrollbar">
            <table class="overview-table">
              <thead class="table-head">
              <tr>
                <th>Plugin</th>
                <th><a href="javascript:;" @click="HandleSort('pick_rate')" :class="{ active: sortBy === 'pick_rate' }">{{ L('Pick rate') }}</a></th>
                <th><a href="javascript:;" @click="HandleSort('win_rate')" :class="{ active: sortBy === 'win_rate' }">{{ L('Win rate') }}</a></th>
              </tr>
              </thead>
              <tbody class="table-body">
              <tr class="body-item" v-for="plugin in pluginList" :key="'plugin_' + plugin.id"
                  :class="(props.highlight === plugin.name || props.highlight === plugin.id) ? 'highlight' : ''">
                <td class="plugin_name">{{ formatPluginName(plugin.id) }}</td>
                <td class="pick_rate">
                  <template v-if="plugin.pick_rate !== 0">
                    <div class="stat-bar-container">
                      <div class="stat-bar" :style="{ width: (plugin.pick_rate * 100) + '%' }"></div>
                      <span class="stat-value">{{ (plugin.pick_rate * 100).toFixed(2) }}%</span>
                    </div>
                  </template>
                </td>
                <td class="win_rate">
                  <template v-if="plugin.win_rate !== 0">
                    <span class="stat-value" :class="plugin.win_rate > 0.5 ? 'good' : 'bad'">
                      {{ (plugin.win_rate * 100).toFixed(2) }}%
                    </span>
                  </template>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-dialog_wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(1, 10, 19, 0.85);
  backdrop-filter: blur(8px);
  z-index: 200;
  animation: fadeIn 0.3s ease-out;
}

.stat-dialog_container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.stat-dialog_body {
  background: linear-gradient(160deg, #0a1428, #050a14);
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 0 1px rgba(200, 155, 60, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stat-dialog_close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-dialog_close:hover {
  color: var(--gold-primary);
  transform: rotate(90deg);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-gold);
}

.header-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  padding: 2px;
  background: conic-gradient(from 160deg, rgba(11, 196, 226, 0.4), rgba(200, 155, 60, 0.45), rgba(11, 86, 118, 0.6), rgba(11, 196, 226, 0.4));
  box-shadow: 0 0 15px rgba(200, 155, 60, 0.3);
}

.header-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--bg-deep);
}

.dialog-header h2 {
  margin: 0;
  font-size: 2rem;
  text-transform: uppercase;
}

.plugin-stat {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-container {
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border-gold);
  border-radius: 3px;
}

.overview-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table-head th {
  padding: 1rem;
  color: var(--gold-primary);
  font-family: var(--font-title);
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background: #0a1428;
  z-index: 10;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
}

.table-head a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.table-head a:hover, .table-head a.active {
  color: var(--gold-highlight);
  text-shadow: 0 0 8px rgba(200, 155, 60, 0.5);
}

.body-item td {
  padding: 1rem;
  border-bottom: 1px solid rgba(163, 129, 74, 0.1);
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.body-item:hover td {
  background: rgba(200, 155, 60, 0.05);
  color: var(--gold-highlight);
}

.highlight td {
  background: rgba(11, 196, 226, 0.1);
  color: var(--accent-blue);
  font-weight: 600;
}

.stat-bar-container {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
}

.stat-bar {
  height: 4px;
  background: var(--gold-primary);
  border-radius: 2px;
  min-width: 2px;
  box-shadow: 0 0 8px rgba(200, 155, 60, 0.4);
}

.stat-value {
  font-family: monospace;
}

.stat-value.good {
  color: #4ade80;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
}

.stat-value.bad {
  color: #f87171;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 768px) {
  .stat-dialog_body {
    padding: 1.5rem;
  }
  
  .body-item td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .dialog-header h2 {
    font-size: 1.5rem;
  }
}
</style>