import Dungeon from "../../BloomCore/dungeons/Dungeon"
import Party from "../../BloomCore/Party"
import { getHypixelPlayer, getMojangInfo } from "../../BloomCore/utils/APIWrappers"
import { bcData, convertToPBTime, convertToSeconds, fn, getRank, getValue } from "../../BloomCore/utils/Utils"
import { getTabCompletion } from "../../BloomCore/utils/Utils2"
import Promise from "../../PromiseV2"
import Config from "../Config"
import { prefix } from "../utils/Utils"

let score = null
let time = null
let wasSuccessful = false // So that it won't count failed runs

// Dungeon.partyInfo = {
//     "UnclaimedBloom6": {
//         "uuid": "307005e7f5474f46b258c9a8b84276c4",
//         "secrets": 229743,
//         "deaths": []
//     }, ...
// }

register("chat", (e) => {
    if (!Config.playerLogging || !Dungeon.inDungeon) return
    let msg = ChatLib.getChatMessage(e).removeFormatting().trim()
    if (msg == "[NPC] Mort: Here, I found this map when I first entered the dungeon.") {
        Dungeon.partyInfo = Dungeon.party.reduce((a, b) => {
            a[b] = {}
            return a
        }, {})
        for (let p of Object.keys(Dungeon.partyInfo)) {
            let player = p
            getMojangInfo(player).then(mi => {
                let uuid = mi.id
                // let player = mi.name
                getHypixelPlayer(uuid, bcData.apiKey).then(playerInfo => {
                    Dungeon.partyInfo[player] = {
                        "uuid": uuid,
                        "secrets": playerInfo.player.achievements.skyblock_treasure_hunter,
                        "deaths": []
                    }
                    // ChatLib.chat(JSON.stringify(Dungeon.partyInfo, "", 4))
                })
            }).catch(e => ChatLib.chat(`&cError initializing players: ${e}`))
        }
        return
    }
    // ☠ Defeated Livid in 01m 02s
    let t = getValue(msg, /☠ Defeated .+ in (.+)/, null)
    if (t) {
        wasSuccessful = true
        time = convertToSeconds(t)
    }
    score = getValue(msg, /Team Score: (\d+) \(.{1,2}\)/, score, "int")
    if (msg == "> EXTRA STATS <" && wasSuccessful && Dungeon.partyInfo) {
        
        if (!FileLib.exists("Bloom", "data/playerLogs.json")) FileLib.write("Bloom", "data/playerLogs.json", "[]")

        let data = {
            "f": Dungeon.floor,
            "ts": new Date().getTime(),
            "t": time,
            "s": score,
            "p": {}
        }
        Promise.all(
            Object.keys(Dungeon.partyInfo).map(a => getHypixelPlayer(Dungeon.partyInfo[a].uuid, bcData.apiKey))
        ).then(values => {
            values.map(v => {
                let uuid = v.player.uuid
                let player = v.player.displayname
                let secretDiff = v.player.achievements.skyblock_treasure_hunter - Dungeon.partyInfo[player].secrets
                data.p[uuid] = {
                    "s": secretDiff,
                    "d": Dungeon.partyInfo[player].deaths,
                    "c": Dungeon.classes[player][0]
                }
            })
            // ChatLib.chat(JSON.stringify(data, "", 4))
            let logs = JSON.parse(FileLib.read("Bloom", "data/playerLogs.json"))
            logs.push(data)
            FileLib.write("Bloom", "data/playerLogs.json", JSON.stringify(logs))
        }).catch(e => ChatLib.chat(`&cError logging players: ${e}`))
    }
})

register("chat", (thing) => {
    if (!Config.playerLogging || !Dungeon.inDungeon || !Dungeon.time || !Dungeon.partyInfo) return
    let match = thing.match(/(\w+) (.+) and became a ghost./)
    let [m, player, reason] = match
    if (player == "You") player = Player.getName()
    if (!Object.keys(Dungeon.partyInfo).includes(player)) return
    reason = reason.replace(/^were/, "was")
    if (Dungeon.bossEntry) return Dungeon.partyInfo[player].deaths.push(`(Boss) ${reason}`)
    if (!Dungeon.partyInfo[player].deaths) return
    Dungeon.partyInfo[player].deaths.push(`(Dung) ${reason}`)
}).setCriteria(" ☠ ${thing}")


register("worldUnload", () => {
    score = null
    wasSuccessful = false
    time = null
})

// Average secrets player has found over the given logs
const getAverageSecrets = (logs, uuid) => {
    let l = logs.filter(a => Object.keys(a.p).includes(uuid))
    if (!l.length) return 0
    return Math.floor(l.map(a => a.p[uuid].s).reduce((a, b) => a+b) / l.length * 100) / 100
}

// Total secrets a player has found in all of the logs
const getTotalSecrets = (logs, uuid) => logs.filter(a => Object.keys(a.p).includes(uuid)).reduce((a, b) => a + b.p[uuid].s, 0)


// let options = {
//     "floor": "F5",
//     "players": [
//         {
//             "uuid": "307005e7f5474f46b258c9a8b84276c4",
//             "name": "UnclaimedBloom6",
//             "rank": "&6[MVP&0++&6]"
//         },
//         {
//             "uuid": "cec63b61e6194c0a8209da248551cfd8",
//             "name": "Hosted",
//             "rank": "&b[MVP&9+&b]"
//         }
//     ]
// }
const handleLogs = (logs, options) => {
    let floor = options.floor
    let players = options.players
    // Filter by specified floor
    if (floor) logs = logs.filter(a => a.f == floor)
    // Filter only the logs with all of the specified players in the run.
    if (players) logs = logs.filter(a => players.every(b => Object.keys(a.p).includes(b.uuid)))
    if (!logs.length) return ChatLib.chat(`${prefix} &cNo logs with the given criteria!`)

    ChatLib.chat(`&a&m${ChatLib.getChatBreak(" ")}`)
    
    ChatLib.chat(`&aRuns Logged: &b&l${fn(logs.length)}${floor ? " &a(&e" + floor + "&a)" : ""}`)
    ChatLib.chat("")
    
    ChatLib.chat(`Average Run Time: ${convertToPBTime(logs.map(a => a.t).reduce((a, b) => a+b) / logs.length * 1000)}`)
    ChatLib.chat(`Average Score: ${Math.floor(logs.map(a => a.s).reduce((a, b) => a+b) / logs.length)}`)
    ChatLib.chat("")
    if (players) {
        players.forEach(p => {
            let totalSecrets = getTotalSecrets(logs, p.uuid)
            let avgSecrets = getAverageSecrets(logs, p.uuid)
            ChatLib.chat(`${p.rank} ${p.name}&f's Average Secrets: &b${avgSecrets} &a(&b${fn(totalSecrets)}&a Total)`)
        })
    }
    ChatLib.chat(`&a&m${ChatLib.getChatBreak(" ")}`)
    // ChatLib.chat(`Your Average Secrets: ${getAverageSecrets(logs, Player.getUUID().replace(/-/g, ""))}`)
}

register("command", (...args) => {
    if (!args || !args.length || !args[0]) {
        ChatLib.chat(`&c/plogs <p:player1,player2,...> <f:floor>`)
        return
    }
    let options = {}

    let logs = JSON.parse(FileLib.read("Bloom", "data/playerLogs.json"))
    let floor = args.find(a => a.startsWith("f:"))
    if (floor) {
        floor = floor.slice(2).toUpperCase()
        if (!logs.some(a => a.f == floor)) return ChatLib.chat(`&cNo runs logged on ${floor}!`)
        options.floor = floor
    }
    let players = args.find(a => a.startsWith("p:"))
    if (players) {
        players = players.slice(2).split(",")
        for (let i = 0; i < players.length; i++) {
            if (players[i] !== "*") continue
            players.splice(i, 1)
            players = players.concat(Object.keys(Party.members))
        }
        if (players.length > 5) return ChatLib.chat(`&cMax is 5 players.`)
        Promise.all(
            players.map(a => getMojangInfo(a))
        ).then(values => {
            for (let i = 0; i < values.length; i++) {
                if (!values[i]) return ChatLib.chat(`&cInvalid Player!`)
            }
            let players = values.map(a => ({
                "uuid": a.id,
                "name": a.name,
                "rank": "&7"
            }))
            Promise.all(
                players.map(a => getHypixelPlayer(a.uuid, bcData.apiKey))
            ).then(values => {
                players.forEach((v, i) => {
                    v.rank = getRank(values[i])
                })
                options.players = players
                // ChatLib.chat(JSON.stringify(players, null, 4))
                handleLogs(logs, options)
            })

        }).catch(e => ChatLib.chat(`&c${e}`))
    }
    else {
        handleLogs(logs, options)
    }
}).setName("plogs")

