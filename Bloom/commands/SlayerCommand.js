import { getHypixelPlayer, getMojangInfo, getRecentProfile, getSbProfiles } from "../../BloomCore/utils/APIWrappers"
import { bcData, calcSkillLevel, fn, getRank, title } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"
import { slayerLevelling } from "../../BloomCore/skills/slayer"
import Promise from "../../PromiseV2"

const bossColors = {
    "zombie": "&4",
    "spider": "&5",
    "wolf": "&f",
    "enderman": "&d",
    "blaze": "&6"
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
            getRecentProfile(uuid, null, bcData.apiKey),
            getHypixelPlayer(uuid, bcData.apiKey)
        ]).then(values => {
            let [profile, playerInfo] = values
            if (!profile) return ChatLib.chat(`${prefix} &cPlayer has no Skyblock profiles!`)
            let formatted = `${getRank(playerInfo)} ${player}`.replace("&7 ", "&7")
            let mem = profile.members[uuid]
            let levels = []
            let totalXP = 0
            let slayerTxt = Object.keys(slayerLevelling).map(a => {
                let boss = mem.slayer_bosses[a]
                if (!boss.xp) {
                    levels.push(0)
                    return ""
                }
                let xp = boss.xp
                totalXP += xp
                let level = Math.floor(calcSkillLevel(a, xp))
                levels.push(level)
                let bossKills = Object.keys(boss).filter(b => b.startsWith("boss_kills_tier_")).map(b => {
                    let tier = parseInt(b[b.length-1]) + 1
                    return [tier, boss[b]]
                }).reduce((a, b) => {
                    a[b[0]] = b[1]
                    return a
                }, {})
                let tiers = Object.keys(bossKills).map(b => `${tierColors[b]}T${b}: &6${fn(bossKills[b])}&r`).join("  ")

                let prevXP = slayerLevelling[a][level]
                let nextXP = slayerLevelling[a][level+1] ?? 0
                if (level == 9) prevXP = xp
                let len = Math.ceil(MathLib.map(xp, prevXP, nextXP, 0, 25)) || 25
                let progressBar = `&6${fn(prevXP)} &a${"".padEnd(len, "=")}&7${"".padEnd(25-len, "-")} &6${nextXP ? fn(nextXP) : "MAX"}`

                return `${bossColors[a]}${title(a)}&r &e${fn(xp)} XP &7(Level &e${level}&7)\n${progressBar}\n${tiers}`
            }).filter(a => !!a)
            let maxLen = slayerTxt.map(a => Renderer.getStringWidth(a.split("\n")[1])).sort((a, b) => a-b).reverse()[0]
            slayerTxt = slayerTxt.join(`\n${"&8&m".padEnd(Math.ceil(maxLen/3))}\n`)
            slayerTxt += `\n\n&bTotal XP: &e${fn(totalXP)}`
            new Message(`${formatted} &8| &a${levels.join("&8-&a")} &8| `, new TextComponent(`&eInfo &7(Hover)`).setHover("show_text", slayerTxt)).chat()
            
        }).catch(e => ChatLib.chat(e))
    })
}).setName("/slayer")
