import { getHypixelPlayer, getMojangInfo } from "../../BloomCore/utils/APIWrappers"
import { bcData, hidePartySpam } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { prefix } from "../utils/Utils"
import Party from "../../BloomCore/Party"

let recentKicks = [] // [[player, timestamp],...]

register("chat", (player, classs) => {
    if (!Config.autoKicker || !bcData.apiKey || Party.leader !== Player.getName()) return
    if (Config.autoKickEveryone) return ChatLib.command(`p kick ${player}`)
    // Auto kick if recently kicked
    if (Config.akRecentKick) {
        if (recentKicks.map(a => a[0]).includes(player)) {
            hidePartySpam(500)
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
        hidePartySpam(500)
        ChatLib.command(`p kick ${player}`)
        ChatLib.chat(`${prefix} &cKicked &b${player} &cfor being &b${classs} &cclass.`)
        return
    }
    // Kick for low secrets
    getMojangInfo(player).then(mojangInfo => {
        let uuid = mojangInfo.id
        getHypixelPlayer(uuid, bcData.apiKey).then(playerInfo => {
            let secrets = playerInfo.player.achievements.skyblock_treasure_hunter
            if (secrets < parseInt(Config.akSecretMin)) {
                hidePartySpam(500)
                ChatLib.command(`p kick ${player}`)
                ChatLib.chat(`${prefix} &cKicked &b${player} &cdue to low secrets!`)
                recentKicks.push([player, new Date().getTime()])
            }
        })
    })
}).setCriteria("Party Finder > ${player} joined the dungeon group! (${classs} Level ${*})")

// Update the recently kicked list
register("tick", () => {
    if (!Config.autoKicker || recentKicks.length == 0) return
    recentKicks.filter(a => new Date().getTime() - a[1] < 360000)
})