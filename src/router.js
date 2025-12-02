
import { createRouter, createWebHashHistory } from 'vue-router'

import PageChampionDB from './pages/champion-db.vue'
import PageShardDB from './pages/shard-db.vue'
import PageShardManager from './pages/shard-manager.vue'

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { name: 'champion-db', path: '/', component: PageChampionDB },
        { name: 'shard-db', path: '/shards', component: PageShardDB },
        { name: 'developer', path: '/developer', component: PageShardManager },
    ]
})
