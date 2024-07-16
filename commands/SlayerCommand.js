import { getHypixelPlayer, getHypixelPlayerV2, getMojangInfo, getRecentProfile, getSbProfiles, getSelectedProfileV2 } from "../../BloomCore/utils/APIWrappers"
import { bcData, calcSkillLevel, fn, getRank, title } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"
import { slayerLevelling } from "../../BloomCore/skills/slayer"
import Promise from "../../PromiseV2"

const bossColors = {
    "zombie": "&4",
    "spider": "&5",
    "wolf": "&f",
    "enderman": "&d",
    "blaze": "&6",
    "vampire": "&5"
}

const tierColors = {
    1: "&a",
    2: "&e",
    3: "&c",
    4: "&4",
    5: "&5"
}

export const slayerCommand = register("command", (name) => {
    if (!bcData.apiKey) return ChatLib.chat(`${prefix} &cAPI Key not set!`)
    if (!name) name = Player.getName()
    getMojangInfo(name).then(mi => {
        if (!mi) return ChatLib.chat(`${prefix} &cInvalid Player!`)
        let player = mi.name
        let uuid = mi.id
        Promise.all([
            getSelectedProfileV2(uuid),
            getHypixelPlayerV2(uuid)
        ]).then(values => {
            let [profile, playerInfo] = values
            if (!profile) return ChatLib.chat(`${prefix} &cPlayer has no Skyblock profiles!`)
            let formatted = `${getRank(playerInfo)} ${player}`.replace("&7 ", "&7")
            let mem = profile.members[uuid]
            let levels = []
            let totalXP = 0

            const slayerData = profile.members[uuid].slayer.slayer_bosses

            if (Object.keys(slayerData).length == 0) {
                ChatLib.chat(`${formatted} &cHas not done any slayer!`)
                return
            }

            let maxLineLength = 0
            let slayerTxt = Object.keys(slayerData).map(boss => {
                if (!(boss in slayerLevelling)) return "Unknown Slayer"

                const xp = slayerData[boss].xp || 0
                const levelData = slayerLevelling[boss]
                const bossData = slayerData[boss]

                if (xp == 0) {
                    levels.push(0)
                    return ""
                }

                totalXP += xp
                let level = Math.floor(calcSkillLevel(boss, xp))
                levels.push(level)

                let bossKills = Object.keys(bossData).filter(b => b.startsWith("boss_kills_tier_")).map(b => {
                    let tier = parseInt(b[b.length-1]) + 1
                    return [tier, bossData[b]]
                }).reduce((a, b) => (a[b[0]] = b[1], a), {})

                let tiers = Object.keys(bossKills).map(b => `${tierColors[b]}T${b}: &6${fn(bossKills[b])}&r`).join("  ")

                let prevXP = levelData[level]
                let nextXP = levelData[level+1] ?? 0
                if (level == 9 || (boss == "vampire" && level == 5)) prevXP = xp
                let len = Math.ceil(MathLib.map(xp, prevXP, nextXP, 0, 25)) || 25
                let progressBar = `&6${fn(prevXP)} &a${"".padEnd(len, "=")}&7${"".padEnd(25-len, "-")} &6${nextXP ? fn(nextXP) : "MAX"}`
                
                let percentToNextLevel = 100
                if (nextXP !== 0) percentToNextLevel = Math.floor((xp - prevXP) / (nextXP - prevXP) * 100)

                const final = `${bossColors[boss]}${title(boss)}&r &e${fn(xp)} XP &7(Level &e${level}&7) &7(&8${percentToNextLevel}%&7)\n${progressBar}\n${tiers}`
                const lineLength = Math.max(...final.split("\n").map(a => Renderer.getStringWidth(a)))

                if (lineLength > maxLineLength) maxLineLength = lineLength

                return final
            }).filter(a => !!a)

            slayerTxt = slayerTxt.join(`\n${"&8&m".padEnd(Math.ceil(maxLineLength/3))}\n`)
            slayerTxt += `\n\n&bTotal XP: &e${fn(totalXP)}`

            new Message(`${formatted} &8| &a${levels.join("&8-&a")} &8| `, new TextComponent(`&eInfo &7(Hover)`).setHover("show_text", slayerTxt)).chat()
            
        }).catch(e => ChatLib.chat(e))
    })
}).setName("/slayer")
