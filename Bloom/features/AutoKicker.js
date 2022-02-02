import Config from "../Config"
import Party from "../utils/Party"
import { prefix, data, getHypixelPlayer, getMojangInfo, hidePartyStuff } from "../utils/Utils"

class AutoKicker {
    constructor() {

        this.recentKicks = [] // [[player, timestamp],...]

        register("chat", (player, classs) => {
            if (!Config.autoKicker || !data.apiKey || Party.leader !== Player.getName()) return
            // Auto kick if recently kicked
            if (Config.akRecentKick) {
                if (this.recentKicks.map(a => a[0]).includes(player)) {
                    hidePartyStuff(500)
                    ChatLib.command(`p kick ${player}`)
                    ChatLib.chat(`${prefix} &cKicked &a${player} &cbecause they were recently kicked.`)
                    this.recentKicks[i][1] = new Date().getTime()
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
                        this.recentKicks.push([player, new Date().getTime()])
                    }
                })
            })
        }).setCriteria("Dungeon Finder > ${player} joined the dungeon group! (${classs} Level ${*})")

        // Update the recently kicked list
        register("tick", () => {
            if (!Config.autoKicker || this.recentKicks.length == 0) return
            this.recentKicks.filter(a => new Date().getTime() - a[1] < 360000)
        })
    }
}

export default new AutoKicker()