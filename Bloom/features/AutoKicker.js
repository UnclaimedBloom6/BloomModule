import Config from "../Config"
import Party from "../utils/Party"
import { prefix, data, getHypixelPlayer, getMojangInfo, hidePartyStuff } from "../utils/Utils"

let recentKicks = [] // [[player, timestamp],...]

register("chat", (player, classs) => {
    if (!Config.autoKicker || !data.apiKey || Party.leader !== Player.getName()) return
    // Auto kick if recently kicked
    if (Config.akRecentKick) {
        if (recentKicks.map(a => a[0]).includes(player)) {
            hidePartyStuff(500)
            ChatLib.command(`p kick ${player}`)
            ChatLib.chat(`${prefix} &cKicked &a${player} &cbecause they were recently kicked.`)
            for (let i = 0; i < recentKicks.length; i++) {
                if (recentKicks[i][0] == player) {
                    recentKicks[i][1] = new Date().getTime()
                    break
                }
            }
            return
        }
    }
    // Kick for being bad class
    if (Config.akKickClasses && Config.akClasses.split(", ").includes(classs)) {
        hidePartyStuff(500)
        ChatLib.command(`p kick ${player}`)
        ChatLib.chat(`${prefix} &cKicked &b${player} &cfor being &b${classs} &cclass.`)
        return
    }
    // Kick for low secrets
    getMojangInfo(player).then(mojangInfo => {
        mojangInfo = JSON.parse(mojangInfo)
        let uuid = mojangInfo.id
        getHypixelPlayer(uuid).then(playerInfo => {
            playerInfo = JSON.parse(playerInfo)
            let secrets = playerInfo.player.achievements.skyblock_treasure_hunter
            if (secrets < parseInt(Config.akSecretMin)) {
                hidePartyStuff(500)
                ChatLib.command(`p kick ${player}`)
                ChatLib.chat(`${prefix} &cKicked &b${player} &cdue to low secrets!`)
                recentKicks.push([player, new Date().getTime()])
            }
        })
    })
}).setCriteria("Dungeon Finder > ${player} joined the dungeon group! (${classs} Level ${*})")

// Update the recently kicked list
register("tick", () => {
    if (!Config.autoKicker || recentKicks.length == 0) return
    recentKicks.filter(a => new Date().getTime() - a[1] < 360000)
})