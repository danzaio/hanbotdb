<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'
import { Scatter } from 'vue-chartjs'
import { heroStat } from "@/components/shards-data"
import { L } from '@/components/language'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Global Chart Options for Magic UI Theme
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Cinzel, serif' } }
    },
    tooltip: {
      backgroundColor: 'rgba(7, 13, 24, 0.9)',
      titleColor: '#c8aa6e',
      bodyColor: '#e2e8f0',
      borderColor: '#c8aa6e',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
      ticks: { color: '#94a3b8' }
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
      ticks: { color: '#94a3b8' }
    }
  }
}

// 1. Win Rate vs Pick Rate (Scatter)
const scatterData = computed(() => {
  const dataPoints = heroStat.value.map(h => ({
    x: (h.stat.pick_rate * 100),
    y: (h.stat.win_rate * 100),
    champion: h.champion.alias
  }))

  return {
    datasets: [{
      label: 'Champions',
      data: dataPoints,
      backgroundColor: 'rgba(11, 196, 226, 0.6)',
      borderColor: '#0bc4e2',
      borderWidth: 1,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  }
})

const scatterOptions = {
  ...commonOptions,
  plugins: {
    ...commonOptions.plugins,
    tooltip: {
      ...commonOptions.plugins.tooltip,
      callbacks: {
        label: (context) => {
          const point = context.raw;
          return `${point.champion}: Pick ${point.x.toFixed(2)}%, Win ${point.y.toFixed(2)}%`;
        }
      }
    }
  },
  scales: {
    x: { ...commonOptions.scales.x, title: { display: true, text: 'Pick Rate (%)', color: '#94a3b8' } },
    y: { ...commonOptions.scales.y, title: { display: true, text: 'Win Rate (%)', color: '#94a3b8' } }
  }
}

</script>

<template>
  <div class="analytics-container">
    <div class="chart-card glass full-width">
      <h3 class="chart-title text-gradient">{{ L('Meta Analysis: Win vs Pick Rate') }}</h3>
      <div class="chart-container">
        <Scatter :data="scatterData" :options="scatterOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-container {
  margin-bottom: 3rem;
  animation: fadeIn 0.5s ease-out;
  width: 100%;
}

.chart-card {
  padding: 1.5rem;
  background: rgba(7, 13, 24, 0.6);
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 400px; /* Fixed height for better visibility */
}

.chart-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  text-align: center;
}

.chart-container {
  flex: 1;
  position: relative;
  width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
