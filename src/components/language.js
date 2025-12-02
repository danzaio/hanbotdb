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
    'Win rate': '胜率'
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
