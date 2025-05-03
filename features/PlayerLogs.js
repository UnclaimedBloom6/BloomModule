import Dungeon from "../../BloomCore/dungeons/Dungeon"
import Party from "../../BloomCore/Party"
import { getHypixelPlayerV2, getMojangInfo, getPlayerUUID } from "../../BloomCore/utils/APIWrappers"
import { getHypixelPlayer, getHypixelPlayerBatch, requestPlayerUUID, requestPlayerUUIDBatch } from "../../BloomCore/utils/ApiWrappers2"
import { onChatPacket } from "../../BloomCore/utils/Events"
import { convertToTimeString, getMedian, timeToMS } from "../../BloomCore/utils/Utils"
import { bcData, convertToPBTime, convertToSeconds, fn, getRank, sortObjectByValues } from "../../BloomCore/utils/Utils"
import Promise from "../../PromiseV2"
import Config from "../Config"
import { prefix } from "../utils/Utils"

let score = null
let time = null

const classes = {
    "T": "Tank",
    "M": "Mage",
    "A": "Archer",
    "H": "Healer",
    "B": "Berserker"
}

// Dungeon.partyInfo = {
//     "UnclaimedBloom6": {
//         "uuid": "307005e7f5474f46b258c9a8b84276c4",
//         "secrets": 229743,
//         "deaths": []
//     }, ...
// }

const initPlayers = () => {
    Dungeon.partyInfo = {}
    Dungeon.party.forEach(player => Dungeon.partyInfo[player] = {
        uuid: null,
        secrets: 0,
        deaths: []
    })
    for (let p of Object.keys(Dungeon.partyInfo)) {
        let player = p
        requestPlayerUUID(player, resp => {
            const { success, uuid, username, reason } = resp

            if (!success) {
                ChatLib.chat(`&cPlayer logs failed to request UUID for ${player}: ${reason}`)
                return
            }

            Dungeon.partyInfo[player].uuid = uuid

            getHypixelPlayer(uuid, resp => {
                const { success, data, reason } = resp

                if (!success) {
                    ChatLib.chat(`&cPlayer logs failed to request player info for ${player}: ${reason}`)
                    return
                }

                Dungeon.partyInfo[player].secrets = data.player.achievements.skyblock_treasure_hunter
            })
        })
        // getPlayerUUID(player).then(uuid => {
        //     if (!uuid) {
        //         ChatLib.chat(`${prefix} &cPlayer logs failed to get UUID for ${uuid}.`)
        //         return
        //     }

        //     Dungeon.partyInfo[player].uuid = uuid
        //     // ChatLib.chat(`[PLAYER LOGS] ${player} UUID: ${uuid}`)
        //     getHypixelPlayerV2(uuid).then(playerInfo => {
        //         Dungeon.partyInfo[player].secrets = playerInfo.player.achievements.skyblock_treasure_hunter
        //         // ChatLib.chat(`[PLAYER LOGS] ${player} SECRETS: ${Dungeon.partyInfo[player].secrets}`)
                
        //         // ChatLib.chat(JSON.stringify(Dungeon.partyInfo, "", 4))
        //     }).catch(e => {
        //         ChatLib.chat(`&cError initializing ${player} (Second Request): ${e}`)
        //         Dungeon.partyInfo[player].secrets = null
        //     })
        // }).catch(e => ChatLib.chat(`&cError getting UUID for ${player}: ${e}`))
    }
}

const logRun = () => {
    if (!FileLib.exists("Bloom", "data/playerLogs.json")) {
        FileLib.write("Bloom", "data/playerLogs.json", "[]")
    }
    
    if (!Dungeon.partyInfo) {
        return
    }
    
    const runData = {
        f: Dungeon.floor,
        ts: Date.now(),
        t: time,
        s: score,
        p: {}
    }

    getHypixelPlayerBatch(Object.values(Dungeon.partyInfo).map(a => a.uuid), resp => {
        const { success, data, reason } = resp

        if (!success) {
            ChatLib.chat(`&cPlayer Logs failed to get Hypixel data: ${reason}`)
            return
        }

        for (let i = 0; i < data.length; i++) {
            let uuid = data[i].player.uuid
            let player = data[i].player.displayname
            let secretDiff = data[i].player.achievements.skyblock_treasure_hunter - (Dungeon.partyInfo[player].secrets ?? 0)
            let clazz = Dungeon.classes[player]
    
            if (!clazz) {
                ChatLib.chat(`&cPlayer logs could not find class for ${player}`)
            }
    
            runData.p[uuid] = {
                s: secretDiff ?? 0,
                d: Dungeon.partyInfo[player].deaths,
                c: clazz ? clazz[0] : "U"
            }
        }

        const logs = JSON.parse(FileLib.read("Bloom", "data/playerLogs.json"))

        logs.push(runData)
        FileLib.write("Bloom", "data/playerLogs.json", JSON.stringify(logs))
    })
}

onChatPacket(() => {
    if (!Config.playerLogging || !Dungeon.inDungeon) return
    initPlayers()
}).setCriteria(/^\[NPC\] Mort: Here, I found this map when I first entered the dungeon\.$/)

onChatPacket(() => {
    if (!Config.playerLogging || !Dungeon.inDungeon) return
    logRun()
}).setCriteria(/^\s*> EXTRA STATS <$/)

onChatPacket((boss, runTime, record) => {
    wasSuccessful = true
    time = convertToSeconds(runTime)
}).setCriteria(/^\s*☠ Defeated (.+) in 0?([\dhms ]+?)\s*(\(NEW RECORD!\))?$/)

onChatPacket((scoreNumber, rating, record) => {
    score = parseInt(scoreNumber)
}).setCriteria(/^\s*Team Score: (\d+) \((.{1,2})\)\s?(\(NEW RECORD!\))?$/)

register("chat", (player, reason) => {
    if (!Config.playerLogging || !Dungeon.inDungeon || !Dungeon.time || !Dungeon.partyInfo) return

    if (player == "You") player = Player.getName()
    if (!(player in Dungeon.partyInfo)) return

    reason = reason.replace(/^were/, "was")
    if (Dungeon.bossEntry) {
        let deaths = Dungeon.partyInfo[player]?.deaths
        if (!deaths) return
        deaths.push(`(Boss) ${reason}`)
        return
    }

    if (!Dungeon.partyInfo[player].deaths) return

    Dungeon.partyInfo[player].deaths.push(`(Dung) ${reason}`)
}).setCriteria(/^ ☠ (\w{1,16}) (.+) and became a ghost\.$/)


register("worldUnload", () => {
    score = null
    wasSuccessful = false
    time = null
})

// Average secrets player has found over the given logs
const getAverageSecrets = (logs, uuid) => {
    let l = logs.filter(a => Object.keys(a.p).includes(uuid))
    if (!l.length) return 0
    return Math.floor(l.map(a => a.p[uuid].s ?? 0).reduce((a, b) => a+b) / l.length * 100) / 100
}

// Total secrets a player has found in all of the logs
const getTotalSecrets = (logs, uuid) => logs.filter(a => Object.keys(a.p).includes(uuid)).reduce((a, b) => a + b.p[uuid].s, 0)

const printPlayerShit = (players, logs) => {
    players.forEach(p => {
        let totalSecrets = getTotalSecrets(logs, p.uuid)
        let avgSecrets = getAverageSecrets(logs, p.uuid)

        let hoverString = `${p.rank} ${p.name}\n`

        const defaultClassData = {}
        Object.keys(classes).forEach(classLetter => {
            defaultClassData[classLetter] = {
                timesPlayed: 0,
                totalSecrets: 0,
                string: `\n&b${classes[classLetter]}: &r0`
            }
        })

        let classData = logs.reduce((a, b) => {
            let thisRun = b.p[p.uuid]
            let playerClass = thisRun.c
            if (!(playerClass in a)) return a

            a[playerClass].timesPlayed++
            a[playerClass].totalSecrets += thisRun.s
            a[playerClass].string = `\n&b${classes[playerClass]}: &r${fn(a[playerClass].timesPlayed)}`

            return a
        }, defaultClassData)
        
        let maxClassWidth = Math.max(...Object.keys(classData).map(a => Renderer.getStringWidth(classData[a].string)))
        hoverString += Object.keys(classData).sort((a, b) => classData[b].timesPlayed - classData[a].timesPlayed).reduce((a, b) => {
            let secretsPerRun = Math.floor(classData[b].totalSecrets / classData[b].timesPlayed*100)/100 || 0
            a += classData[b].string
            if (secretsPerRun) {
                a += " ".repeat(Math.floor((maxClassWidth - Renderer.getStringWidth(classData[b].string))/3))
                a += ` &a(&b${secretsPerRun} &esecrets/run&a)`
            }
            return a
        }, "&eClasses Played:")
        
        // Death Shit
        let deaths = logs.reduce((a, b) => {
            b.p[p.uuid].d.forEach(death => {
                if (!(death in a)) a[death] = 0
                a[death]++
            })
            return a
        }, {})
        let totalDeaths = Object.values(deaths).reduce((a, b) => a+b, 0)
        let uniqueDeaths = Object.keys(deaths).length
        let mostFrequentDeaths = Object.keys(deaths).sort((a, b) => deaths[b] - deaths[a]).slice(0, 5)
        let deathsTitle = `\n\n&eTotal Deaths: &c${fn(totalDeaths)} &e(&c${Math.floor(totalDeaths/logs.length*100)/100} &ePer Run)`
        hoverString += mostFrequentDeaths.reduce((a, b, i) => {
            let inBoss = b.split(" ")[0] == "(Boss)"
            a += `\n&b#${i+1} &e(&c${deaths[b]}&e): &r${b.slice(7)} ${inBoss ? "&c(Boss)" : "&b(Clear)"}`
            return a
        }, deathsTitle)
        if (uniqueDeaths > 5) hoverString += `\n    &e... ${uniqueDeaths-5} more`

        // Printing and stuff
        // ChatLib.chat(JSON.stringify(classCounts, null, 4))
        new TextComponent(`${p.rank} ${p.name}&f's Average Secrets: &b${avgSecrets} &a(&b${fn(totalSecrets)}&a Total)`).setHover("show_text", hoverString).chat()
    })
}

const printUserCriteria = (options) => {
    let floor = options.floor
    let players = options.players
    let time = options.time
    let partySize = options.partySize
    let score = options.score
    let runTime = options.runTime

    let message = "&aShowing runs logged with"

    if (!players) message += " any players on"
    else message += players.map(a => ` ${a.rank} ${a.name}`).join("&r,") + " &aon"

    message += floor ? ` &6${floor}&a` : " any floor"

    if (time) {
        let timeStr = convertToTimeString(time)
        message += ` the past &6${timeStr}&a`
    }

    if (partySize) {
        let [symbol, size] = partySize
        let sizeStr = ` with a party size of &6${size}&a`
        if (symbol == "<") sizeStr += " or less"
        if (symbol == ">") sizeStr += " or more"
        message += sizeStr
    }

    if (score) {
        let [symbol, scoreInt] = score
        let scoreStr = ` and score of `
        if (symbol == "<") scoreStr += `less than &6${scoreInt}&a`
        else if (symbol == ">") scoreStr += `&6${scoreInt}&a or more`
        else scoreStr += `&6${scoreInt}&a`
        message += scoreStr
    }

    if (runTime) {
        let [symbol, _, time] = runTime
        let runTimeStr = ` and run time of `
        if (symbol == "<") runTimeStr += `less than &6${time}&a`
        else if (symbol == ">") runTimeStr += `&6${time}&a or more`
        else runTimeStr += `&6${time}&a`
        message += runTimeStr
    }

    message += "."

    ChatLib.chat(message)
}

const handleLogs = (logs, options) => {
    let floor = options.floor
    let players = options.players
    let time = options.time
    let partySize = options.partySize
    let score = options.score
    let runTime = options.runTime

    // Filter by specified floor
    if (floor) logs = logs.filter(a => a.f == floor)

    // Filter only the logs with all of the specified players in the run.
    if (players) logs = logs.filter(a => players.every(b => Object.keys(a.p).includes(b.uuid)))

    if (time) {
        const now = Date.now()
        logs = logs.filter(a => now - a.ts < time)
    }

    if (partySize) {
        let [symbol, number] = partySize

        let filterFunc = i => Object.keys(i.p).length == number
        if (symbol == "<") filterFunc = i => Object.keys(i.p).length < number
        if (symbol == ">") filterFunc = i => Object.keys(i.p).length > number

        logs = logs.filter(filterFunc)
    }
    
    if (score) {
        let [symbol, scoreInt] = score

        let filterFunc = i => i.s == scoreInt
        if (symbol == "<") filterFunc = i => i.s < scoreInt
        if (symbol == ">") filterFunc = i => i.s >= scoreInt

        logs = logs.filter(filterFunc)
    }
    
    if (runTime) {
        let [symbol, timeSecs] = runTime
    
        let filterFunc = i => i.t == timeSecs
        if (symbol == "<") filterFunc = i => i.t < timeSecs
        if (symbol == ">") filterFunc = i => i.t >= timeSecs
    
        logs = logs.filter(filterFunc)
    }

    if (!logs.length) return ChatLib.chat(`${prefix} &cNo logs with the given criteria!`)

    ChatLib.chat(`&a&m${ChatLib.getChatBreak(" ")}`)
    printUserCriteria(options)
    ChatLib.chat(`&aRuns Logged: &b&l${fn(logs.length)}`)
    ChatLib.chat("")
    
    const times = logs.map(a => a.t * 1000).filter(a => !!a).sort((a, b) => a-b)
    // const avgRunTime = times.reduce((a, b) => a+b) / times.length
    const medianRunTime = getMedian(times)
    const lowestRunTime = Math.min(...times)
    const maxRunTime = Math.max(...times)
    const averageScore = Math.floor(getMedian(logs.map(a => a.s)))
    
    ChatLib.chat(`&aFastest Run: &b${convertToPBTime(lowestRunTime)}`)
    // ChatLib.chat(`Average Run Time: &b${convertToPBTime(avgRunTime)}`)
    ChatLib.chat(`&eAverage Run: &b${convertToPBTime(medianRunTime)}`)
    ChatLib.chat(`&cSlowest Run: &b${convertToPBTime(maxRunTime)}`)
    ChatLib.chat(`&dAverage Score: &a${averageScore}`)
    ChatLib.chat("")

    if (players) printPlayerShit(players, logs)

    ChatLib.chat(`&a&m${ChatLib.getChatBreak(" ")}`)
    // ChatLib.chat(`Your Average Secrets: ${getAverageSecrets(logs, Player.getUUID().replace(/-/g, ""))}`)
}

const handleLogsNoOptions = (logs) => {
    let floorSums = sortObjectByValues(logs.reduce((a, b) => {
        const floor = b.f
        if (!a[floor]) a[floor] = 0
        a[floor]++
        return a
    }, {}), true)
    let floorsStr = Object.keys(floorSums).reduce((a, b) => a += `\n${b.startsWith("M") ? "&c" : "&a"}${b}&f: &a${fn(floorSums[b])}`, "&eFloors Ran")

    let players = sortObjectByValues(logs.reduce((a, b) => {
        const party = b.p
        Object.keys(party).forEach(player => {
            if (!a[player]) a[player] = 0
            a[player]++
        })
        return a
    }, {}), true)

    delete players[Player.getUUID().replace(/-/g, "")]

    // Make a request to the api/player method for every player in the party at the same time.
    const topUUIDs = Object.keys(players).slice(0, 10)
    getHypixelPlayerBatch(topUUIDs, resp => {
        const { success, data, reason } = resp
        if (!success) {
            ChatLib.chat(`Could not fetch Hypixel data for top 10 players: ${reason}`)
            return
        }

        ChatLib.chat(`&a&m${ChatLib.getChatBreak(" ")}`)
        ChatLib.chat(`&aShowing all runs logged with no filters.`)
    
        // Floors
        new TextComponent(`&aRuns Logged: &b&l${fn(logs.length)} &7(Hover)`).setHover("show_text", floorsStr).chat()
        
        // Unique players
        let playerStr = data.reduce((a, b) => a += b ? `\n${getRank(b)} ${b.player.displayname}&e: ${players[b.player.uuid]}` : "\nUnknown Player", "&eTop 10 Players")
        new TextComponent(`&aUnique Players: &b${Object.keys(players).length} &7(Hover)`).setHover("show_text", playerStr).chat()
    
        // Class shit
        let classHover = "&eClass Statistics"
        classHover += "\n&7This is counting every player\n&7in every run. Eg a 4m 1a\n&7party would add 4 mages\n&7and one archer to the total."
        let classData = logs.reduce((a, b) => {
            const party = b.p
            Object.keys(party).forEach(player => {
                const playerData = party[player] // {s: 0, d: ["was killed by Noob!"], c: "M"}
                const playerClass = playerData.c
                if (playerClass == "U") return
                if (!(playerClass in a)) a[playerClass] = {
                    timesPlayed: 0,
                    totalSecrets: 0,
                    deaths: 0
                }
                a[playerClass].timesPlayed++
                a[playerClass].totalSecrets += playerData.s
                a[playerClass].deaths += playerData.d.length
            })
            return a
        }, {})
        classData = Object.keys(classData).sort((a, b) => classData[b].timesPlayed - classData[a].timesPlayed).reduce((a, b) => (a[b] = classData[b], a), {})
    
        Object.keys(classData).forEach(clazz => {
            let secretsPerRun = Math.floor(classData[clazz].totalSecrets / classData[clazz].timesPlayed*100)/100
            let deathsPerRun = Math.floor(classData[clazz].deaths / classData[clazz].timesPlayed*100)/100
            classHover += `\n&e${classes[clazz]}:`
            classHover += `\n  &aTotal Players: &r${classData[clazz].timesPlayed}`
            classHover += `\n  &aTotal Secrets: &b${fn(classData[clazz].totalSecrets)} &a(&b${fn(secretsPerRun)}/run&a)`
            classHover += `\n  &aDeaths/run: &c${deathsPerRun}`
        })
    
        new TextComponent(`&eClass Statistics &7(Hover)`).setHover("show_text", classHover).chat()
    
        ChatLib.chat("")
        ChatLib.chat(`&a&m${ChatLib.getChatBreak(" ")}`)
    })

}

// // Example options to filter dungeon runs
// const options = {
//     floor: "F5",
//     partySize: [">", 2], // More than two players in the party
//     score: [">", 300], // 300 or more score. (> is inclusive of the number, < is not. >300 means '300 or more', <300 means 'less than 300'. For convenience.)
//     time: 60000, // Milis since the run ended
//     players: [
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

register("command", (...args) => {
    if (!FileLib.exists("Bloom", "data/playerLogs.json")) return ChatLib.chat(`${prefix} &cNo runs logged!`)
    let logs = JSON.parse(FileLib.read("Bloom", "data/playerLogs.json"))
    if (!args || !args.length || !args[0]) return handleLogsNoOptions(logs)

    if (args[0] == "help") {
        ChatLib.chat(`&c/plogs [p:player1,player2,...] [f:floor]`)
        return
    }

    let options = {}

    // Command Arguments Parsing

    // Floor Argument
    let floor = args.find(a => a.startsWith("f:"))
    if (floor) {
        floor = floor.slice(2).toUpperCase()
        if (!logs.some(a => a.f == floor)) return ChatLib.chat(`&cNo runs logged on ${floor}!`)
        options.floor = floor
    }

    // Time Argument
    let time = args.find(a => a.startsWith("t:"))
    if (time) {
        options.time = timeToMS(time.slice(2))
    }

    // Party Size Argument
    let psize = args.find(a => a.startsWith("ps:"))
    if (psize) {
        // Validate the party size using https://regex101.com/r/Df7qX4/1
        let match = psize.match(/^ps:([<>])?([1-5])$/)
        if (!match) return ChatLib.chat(`&cInvalid party size argument! Try: ps:2 or ps:<5 etc.`)
        let [_, symbol, number] = match
        options.partySize = [symbol, parseInt(number)]
    }

    // Score Argument
    let scoreArg = args.find(a => a.startsWith("s:"))
    if (scoreArg) {
        // https://regex101.com/r/BRYdfk/1
        let match = scoreArg.match(/^s:([<>])?(\d{1,3})$/)
        if (!match) return ChatLib.chat(`&cInvalid score argument! Try: s:>300 for S+ runs.`)
        let [_, symbol, score] = match
        options.score = [symbol, parseInt(score)]
    }

    let runSpeedArg = args.find(a => a.startsWith("rs:"))
    if (runSpeedArg) {
        // https://regex101.com/r/R1yO0b/1
        let match = runSpeedArg.match(/^rs:([<>])?([\dmsh]+)$/)
        if (!match) return ChatLib.chat(`&cInvalid run speed argument! Examples: rs:<3m rs:>5m30s rs:3m`)
        let [_, symbol, time] = match
        options.runTime = [symbol, timeToMS(time)/1000, time]
    }

    // Handle players argument differently since the UUID needs to be grabbed for each player.
    let players = args.find(a => a.startsWith("p:"))
    if (players) {
        players = players.slice(2).split(",")

        for (let i = 0; i < players.length; i++) {
            if (players[i] !== "*") {
                continue
            }

            players.splice(i, 1)
            players = players.concat(Object.keys(Party.members))
        }

        if (players.length > 5) {
            ChatLib.chat(`&cMax is 5 players.`)
            return
        }

        const playerList = [...players]

        requestPlayerUUIDBatch(playerList, (resp) => {
            if (!resp.success) {
                ChatLib.chat(`&cPlayer Logs failed to request UUIDs: ${resp.reason}`)
                return
            }

            const players = resp.data.map(a => ({
                uuid: a.uuid,
                name: a.username,
                rank: "&7"
            }))

            getHypixelPlayerBatch(players.map(a => a.uuid), (resp) => {
                if (!resp.success) {
                    ChatLib.chat(`&cPlayer Logs failed to request player info: ${resp.reason}`)
                    return
                }

                for (let i = 0; i < resp.data.length; i++) {
                    players[i].rank = getRank(resp.data[i])
                }

                options.players = players
                handleLogs(logs, options)
            })
        })

        return
    }

    // Handle logs with the previous options, but no players option.
    handleLogs(logs, options)

}).setName("plogs")
