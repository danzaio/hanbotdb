import { ref } from "vue";

const t = {
    'DAILY': '每日数据',
    'GAME PATCH': '游戏版本',
    'Data source is switched to: ': '数据源已切换至: ',
    'DataSource:': '数据源:',
    'Search...': '搜索...',
    'Search shard...': '搜索合集...',
    'Champion': '英雄',
    'Shard': '合集',
    'Shard DB': 'Hanbot Database',
    'Developer': '开发者',
    'Pick rate': '选率',
    'Win rate': '胜率',
    'Hanbot Database': 'Hanbot 数据库',
    'Shard View': '合集视图',
    'Search champions...': '搜索英雄...',
    'All Roles': '所有定位',
    'Fighter': '战士',
    'Tank': '坦克',
    'Mage': '法师',
    'Assassin': '刺客',
    'Support': '辅助',
    'ADC': '射手',
    'Sort by Pick Rate': '按选率排序',
    'Sort by Win Rate': '按胜率排序',
    'Meta Analysis: Win vs Pick Rate': '环境分析：胜率 vs 选率',
    'Champions': '英雄',
    'Pick Rate (%)': '选率 (%)',
    'Win Rate (%)': '胜率 (%)',
    'Pick': '选率',
    'Win': '胜率'
};

export const language = ref("EN")
if (/zh-/.test(navigator.language)) {
    language.value = "CN"
}
export function L(en) {
    if (language.value === "CN" && t[en]) return t[en];
    return en;
}
export function changeLanguage() {
    if (language.value === "EN") {
        language.value = "CN"
    } else {
        language.value = "EN"
    }
}
export default {
    language,
    changeLanguage,
    L,
}
