import {ref} from "vue";
import $ from 'jquery'

let heroList = {}
$.getJSON("//game.gtimg.cn/images/lol/act/img/js/heroList/hero_list.js", function (data) {
    heroList = {}
    for (const hero of data.hero) {
        heroList[hero.alias] = hero
    }
    fetchData()
})


let heroStat = ref([])
let shardStat = ref([])
let isDaily = ref(false)

function fetchData(use_proxy) {
    heroStat.value = []

    let data_url = ''
    if (isDaily.value) {
        data_url = use_proxy
            ? "https://c.elizblog.xyz/hanbot_shards.json"
            : "https://b.elizblog.xyz/hanbot_shards.json"
    } else {
        data_url = use_proxy
            ? "https://c.elizblog.xyz/badspacebar/release/refs/heads/master/files/shards.json"
            : "https://raw.githubusercontent.com/badspacebar/release/master/files/shards.json"
    }

    $.ajaxSetup({
        timeout: 10*1000
    })

    $.getJSON(data_url, function (data) {
        const tmp1 = [];
        const tmp2 = [];

        for (const alias in data) {
            if (heroList[alias]) {
                tmp1.push({
                    stat: data[alias],
                    champion: heroList[alias]
                })

                for (const shard of data[alias].shards){
                    let entry = tmp2.find(e => e.name === shard.name)
                    if (!entry) tmp2.push(entry = {name: shard.name, support: []})
                    entry.support.push({
                        shard: shard,
                        stat: data[alias],
                        champion: heroList[alias]
                    })
                }
            }
        }

        tmp1.sort((a, b) => b.stat.pick_rate - a.stat.pick_rate)
        tmp2.sort((a, b) => b.name > a.name ? -1 : 1)
        tmp2.forEach(e => e.support.sort((a, b) => b.shard.pick_rate * b.stat.pick_rate - a.shard.pick_rate * a.stat.pick_rate))

        heroStat.value = tmp1;
        shardStat.value = tmp2;
        // console.log('heroStat', heroStat.value);
        // console.log('shardStat', shardStat.value);

    }).fail(function() {
        if(!use_proxy) fetchData(true)
    })
}



export {
    heroStat,
    shardStat,
    isDaily,
    fetchData
}