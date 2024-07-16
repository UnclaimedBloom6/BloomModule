import { getHypixelPlayer, getMojangInfo } from "../../BloomCore/utils/APIWrappers"
import { bcData, hidePartySpam } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { prefix } from "../utils/Utils"
import Party from "../../BloomCore/Party"

let recentKicks = {} // {player: timestamp}

const doRecentKickStuff = (player) => {
    if (!(player in recentKicks)) return false
    hidePartySpam(500)
    ChatLib.command(`p kick ${player}`)
    ChatLib.chat(`${prefix} &cKicked &a${player} &cbecause they were recently kicked.`)
    recentKicks[player] = Date.now()
    return true
}

const doClassKickStuff = (player, classs) => {
    if (!Config.akClasses.split(", ").includes(classs)) return false
    hidePartySpam(500)
    ChatLib.command(`p kick ${player}`)
    ChatLib.chat(`${prefix} &cKicked &b${player} &cfor being &b${classs} &cclass.`)
    return true
}

const doSecretKickStuff = (player) => {
    getMojangInfo(player).then(mojangInfo => {
        let uuid = mojangInfo.id
        getHypixelPlayer(uuid, bcData.apiKey).then(playerInfo => {
            let secrets = playerInfo.player.achievements.skyblock_treasure_hunter
            if (secrets < parseInt(Config.akSecretMin)) {
                hidePartySpam(500)
                ChatLib.command(`p kick ${player}`)
                ChatLib.chat(`${prefix} &cKicked &b${player} &cdue to low secrets!`)
                recentKicks[player] = Date.now()
            }
        })
    })
}

register("chat", (player, classs) => {
    if (!Config.autoKicker || !bcData.apiKey || Party.leader !== Player.getName()) return
    if (Config.autoKickEveryone) return ChatLib.command(`p kick ${player}`)

    // Auto kick if recently kicked
    if (Config.akRecentKick && doRecentKickStuff(player)) return

    // Kick for being bad class
    if (Config.akKickClasses && doClassKickStuff(player, classs)) return

    // Kick for low secrets
    doSecretKickStuff(player)
    
}).setCriteria("Party Finder > ${player} joined the dungeon group! (${classs} Level ${*})")

// Update the recently kicked list
register("tick", () => {
    if (!Config.autoKicker) return
    const now = Date.now()
    Object.keys(recentKicks).forEach(player => {
        if (now - recentKicks[player] > 3.6e5) delete recentKicks[player]
    })
})