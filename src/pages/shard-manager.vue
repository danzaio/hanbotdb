<script setup>
import {nextTick, ref} from 'vue'
import $ from 'jquery'
import {changeLanguage, language, L} from '@/components/language'

let auth = ref({})
let loading = ref(false)
const API_HOST = 'https://b.elizblog.xyz'

let shardStat = ref({})
let championTierData = {}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


let startDate = ref((() => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 7);
  return formatDate(defaultDate)
})());
let endDate = ref(formatDate(new Date()));

function handleGetStat() {
  loading.value = true
  shardStat.value = {}
  const date1 = formatDate(startDate.value)
  const date2 = formatDate(endDate.value)

  $.ajax({
    method: 'POST',
    url: API_HOST + '/p/bot/dev',
    data: {
      action: 'get_stat',
      champion: 1,
      date1,
      date2
    },
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true,
    success: function (response) {
      loading.value = false
      if (response.msg !== 'OK') {
        alert(response.msg);
        return;
      }

      shardStat.value = response.data.stat
      championTierData = response.data.t

      nextTick(() => {
        buildCharts()
      })
    },
    error: function (jqXHR, textStatus, errorThrown) {
      loading.value = false
      if (jqXHR.status === 0) {
        alert('Network error. Please check your internet connection.');
      } else {
        alert('Error: ' + textStatus + ' - ' + errorThrown);
      }
    },
  });
}

function handleLogin() {
  if (sessionStorage.auth) {
    auth.value = JSON.parse(sessionStorage.auth)
    return
  }

  if (!location.search || !location.search.includes("hash=")) {
    alert('This page need to be opened from telegram')
    return
  }

  loading.value = true
  $.ajax({
    method: 'POST',
    url: API_HOST + '/p/bot/dev',
    data: {
      action: 'login',
      data: location.search
    },
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true,
    success: function (response) {
      loading.value = false
      if (response.msg !== 'OK') {
        alert(response.msg);
        return;
      }
      auth.value = response.data
      sessionStorage.auth = JSON.stringify(response.data)
    },
    error: function (jqXHR, textStatus, errorThrown) {
      loading.value = false
      if (jqXHR.status === 0) {
        alert('Network error. Please check your internet connection.');
      } else {
        alert('Error: ' + textStatus + ' - ' + errorThrown);
      }
    }
  });
}


function buildCharts(shardFilter, championFilter) {
  const echarts = window.echarts
  if (!window.echarts) {
    var script = document.createElement('script')
    script.type = 'text/javascript';
    script.src = "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"
    script.onload = () => {
      buildCharts()
    }
    document.getElementsByTagName('head')[0].appendChild(script)
    return
  }

  for (const shard_name in shardStat.value) {

    if (shardFilter && shard_name !== shardFilter) {
      continue;
    }

    const chart_id = 'chart_' + shard_name
    const shard_data = shardStat.value[shard_name]

    const chartDom = document.getElementById(chart_id);
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom, 'dark', {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const temp = {};
    for (const champion in shard_data) {
      if (championFilter && championFilter !== 'ALL' && champion !== championFilter) {
        continue
      }

      for (const day_data of shard_data[champion]) {
        if (!temp[day_data.date]) {
          temp[day_data.date] = {all: 0, win: 0}
        }
        temp[day_data.date].all += parseInt(day_data.all)
        temp[day_data.date].win += parseInt(day_data.win)
      }
    }


    let chartData = [];
    for (const key in temp) {
      chartData.push({
        date: key,
        all: temp[key].all,
        win: temp[key].win,
      })
    }

    chartData.sort((a, b) => (new Date(a.date)).getTime() - (new Date(b.date)).getTime())

    let option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 20, 40, 0.9)',
        borderColor: '#c8aa6e',
        textStyle: {
          color: '#f0e6d2'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(e => e.date),
        axisLabel: { color: '#a09b8c' },
        axisLine: { lineStyle: { color: '#31271a' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#a09b8c' },
        splitLine: { lineStyle: { color: 'rgba(163, 129, 74, 0.1)' } }
      },
      series: [
        {
          name: 'Total',
          data: chartData.map(e => e.all),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#0bc4e2' },
          lineStyle: { width: 3 }
        },
        {
          name: 'Win',
          data: chartData.map(e => e.win),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#c8aa6e' },
          lineStyle: { width: 3 }
        }
      ]
    }
    myChart.setOption(option)
  }
}


function handleChartChampionChange(shard_name) {
  const ele = document.getElementById('chart_champion_' + shard_name)
  if (ele) {
    buildCharts(shard_name, ele.value)
  }
}

function calcTest(shard_data) {

  let all = 0
  for (const champion in shard_data) {

    let win_count = 0;
    for (const day_data of shard_data[champion])
      win_count += day_data.win

    if (championTierData[champion] === undefined)
      championTierData[champion] = 3

    const championWeight = (1 + championTierData[champion]) * 2
    all += parseInt(win_count * championWeight)
  }

  return all / 100
}

handleLogin();
window.history.replaceState(null, document.title, location.href.replace(location.search, ''))
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

    <div v-if="!auth.name" class="loading-screen">
      <h2 class="text-gradient">Loading...</h2>
    </div>

    <div v-else>
      <header class="glass magic-header">
        <div class="header-inner">
          <div class="logo-section">
            <h1 class="text-gradient">{{ L('Developer Dashboard') }}</h1>
          </div>
          <nav class="nav-actions">
             <button class="magic-btn" @click="changeLanguage">
              {{ language }}
            </button>
          </nav>
        </div>
      </header>

      <main class="main-content">
        <div class="dashboard-controls magic-card">
          <div class="user-info">
            <span>Welcome back, <strong>{{ auth.name }}</strong></span>
          </div>

          <div class="controls-row">
            <div class="control-group">
              <label for="startDate">From</label>
              <input type="date" id="startDate" v-model="startDate" class="magic-input">
            </div>
            <div class="control-group">
              <label for="endDate">To</label>
              <input type="date" id="endDate" v-model="endDate" class="magic-input">
            </div>
            <button @click="handleGetStat" :disabled="loading" class="magic-btn primary">
              {{ loading ? 'Loading...' : 'Update Stats' }}
            </button>
          </div>
        </div>

        <div class="charts-container">
          <div v-if="loading" class="loading-state">
            <h2>Loading data...</h2>
          </div>
          <div v-else>
            <div v-for="(shard_data, shard_name) in shardStat" :key="'chart_' + shard_name" class="chart-card magic-card">
              <div class="chart-header">
                <h3 class="text-gradient">{{ shard_name }}</h3>
                <div class="chart-controls">
                  <select :id="'chart_champion_' + shard_name" @change="handleChartChampionChange(shard_name)" class="magic-input">
                    <option value="ALL">All Champions</option>
                    <option v-for="(data, champion) in shard_data"
                            :key="'chart_' + shard_name + '_' + champion"
                            :value="champion">{{ champion }}
                    </option>
                  </select>
                  <span v-if="auth.name.includes('admin')" class="admin-stat">{{ calcTest(shard_data) }}</span>
                </div>
              </div>
              <div :id="'chart_' + shard_name" class="chart-body"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  padding-top: 90px;
}

.loading-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
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

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-controls {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-info {
  font-size: 1.1rem;
  color: var(--gold-highlight);
}

.controls-row {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chart-card {
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-body {
  height: 400px;
  width: 100%;
}

.admin-stat {
  font-family: monospace;
  background: var(--bg-element);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  color: var(--gold-primary);
}

@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-wrapper {
    padding-top: 160px;
  }

  .controls-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
