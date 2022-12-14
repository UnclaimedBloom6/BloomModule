import Party from "../../BloomCore/Party"
import { catacombs } from "../../BloomCore/skills/catacombs"
import { getHypixelPlayer, getMojangInfo, getProfileByID, getRecentProfile } from "../../BloomCore/utils/APIWrappers"
import { bcData, calcSkillLevel, convertToPBTime, fn, getRank } from "../../BloomCore/utils/Utils"
import { getTabCompletion } from "../../BloomCore/utils/Utils2"
import Promise from "../../PromiseV2"
import { prefix } from "../utils/Utils"

let lastDsCommand = null
export const dsCommand = register("command", (player, profileid=null) => {
    if (!bcData.apiKey) return ChatLib.chat(`${prefix} &cError: API Key not set! Set it with &b/bl setkey <key>`)
    if (player == "p") {
        ChatLib.chat(`${prefix} &aRunning /ds on all party members...`)
        return Object.keys(Party.members).filter(a => a !== Player.getName()).map(a => ChatLib.command(`ds ${a}`, true))
    }
    let message = null
	if (!player) player = Player.getName()
	if (!lastDsCommand || new Date().getTime() - lastDsCommand > 1000) {
		message = new Message(`${prefix} &aGetting Dungeon Stats for ${player}...`).chat()
		lastDsCommand = new Date().getTime()
	}
	getMojangInfo(player).then(mojangInfo => {
        let [player, uuid] = [mojangInfo.name, mojangInfo.id]
        Promise.all([
            getHypixelPlayer(uuid, bcData.apiKey),
            !profileid ? getRecentProfile(uuid, null, bcData.apiKey) : getProfileByID(profileid, bcData.apiKey)
        ]).then(values => {
            let [playerInfo, sbProfile] = values
            if (!playerInfo) return ChatLib.chat(`${prefix} &cCouldn't get player info for ${player}`)
            if (!sbProfile) return ChatLib.chat(`${prefix} &cCouldn't get ${player}'s Skyblock profile!`)
            
            let playerName = playerInfo.player.displayname
            let nameFormatted = `${getRank(playerInfo)} ${playerName}&r`
            if (!Object.keys(sbProfile.members[uuid].dungeons.dungeon_types.catacombs).length) {
                ChatLib.clearChat(6457654)
                return ChatLib.chat(`${prefix} &c${playerName} has never entered the Catacombs!`)
            }
            let profileName = sbProfile["cute_name"]
            let secretsFound = playerInfo.player.achievements.skyblock_treasure_hunter
            secretsFound = !secretsFound ? 0 : secretsFound
            
            let dung = sbProfile["members"][uuid]["dungeons"]
            let master = sbProfile["members"][uuid]["dungeons"]["dungeon_types"]["master_catacombs"]
            let cata = sbProfile["members"][uuid]["dungeons"]["dungeon_types"]["catacombs"]
            
            let playedMM = !!Object.keys(master).length
            
            let selectedClass = dung["selected_dungeon_class"]
    
            const prettify = (level) => level == 120 ? `&b&l${level}` : level >= 50 ? `&6&l${level}` : `${level}`
            
            let cataXP = Math.floor(cata["experience"])
            let cataLevel = calcSkillLevel("catacombs", cataXP)
            let cataLevelInt = Math.floor(cataLevel)
            let cataLevelStr = prettify(cataLevel)
            let cataLow = cataLevel > 50 ? 50 : cataLevelInt
            
            let totalNormal = 0
            let totalMaster = 0
            
            const classWithSymbols = {
                "mage":"⚚ Mage",
                "healer":"☤ Healer",
                "archer":"➶ Archer",
                "tank":"። Tank",
                "berserk":"⚔ Berserk"
            }
            let nameHover = `${nameFormatted} &a- &e${profileName}`
            let classLvls = []
            Object.keys(dung["player_classes"]).forEach(classs => {
                let classXP = parseInt(dung["player_classes"][classs]["experience"])
                let classLvl = calcSkillLevel(classs, classXP)
                classLvls.push(classLvl)
                let xpCurr = classLvl >= 50 ? (classXP - catacombs[50])%2e8 : parseInt(classXP - catacombs[parseInt(classLvl)])
                let xpNext = classLvl >= 50 ? 2e8 : catacombs[parseInt(classLvl)+1] - catacombs[parseInt(classLvl)] || 0
                nameHover += `\n${classs == selectedClass ? "&a" : "&c"}${classWithSymbols[classs]} - &e${prettify(classLvl)}    &a(&6${fn(xpCurr)}&a/&6${fn(xpNext)}&a)`
                
            })
            let classAverage = Math.round(classLvls.reduce((a, b) => a + b) / classLvls.length * 100) / 100
            nameHover += `\n\n&cClass Average: ` + (classAverage == 50 ? `&6&l${classAverage}` : `&e${classAverage}`)
            nameHover += `\n\n&d&lSkyCrypt &7(Click)\n&ahttps://sky.shiiyu.moe/stats/${playerName}`
            const getCompHover = () => {
                let str = "&cCompletions"
                for (let floor = 1; floor <= 7; floor++) {
                    let comps = cata["tier_completions"][floor] == undefined ? 0 : cata["tier_completions"][floor]
                    let masterComps = playedMM && Object.keys(master).includes("tier_completions") ? master["tier_completions"][floor] == undefined ? "" : master["tier_completions"][floor] : ""
                    let masterStr = masterComps == "" ? "" : ` &8| &c${master["tier_completions"][floor]}`
                    totalNormal += comps
                    totalMaster += masterComps == "" ? 0 : masterComps
                    str += `\n&e${floor}] &a${fn(comps)}${masterStr}`
                }
                return str
            }
            let xpNext = catacombs[cataLow+1] - catacombs[cataLow]
            xpNext = isNaN(xpNext) ? 0 : xpNext
            let percentTo50 = Math.floor(cataXP / catacombs[catacombs.length - 1] * 10000) / 100
            let cataHover = `&e&nCatacombs\n` +
                `&bTotal XP: &6${fn(cataXP)}\n` +
                `&aProgress: &6${fn(cataXP - catacombs[cataLow])}&a/&6${fn(xpNext)}\n` +
                (cataLevel < 50 ? `&eRemaining: &6${fn(parseInt(catacombs[cataLow+1] - cataXP) || 0)}\n` : "") +
                `&dPercent To 50: &6${percentTo50}%`
            if (cataLevel > 50) cataHover += `\n&cProgress: &6${fn((cataXP - catacombs[50])%2e8)}&c/&6200,000,000`
            let compHover = getCompHover() + `\n&a${fn(totalNormal)}`
            compHover += totalMaster == 0 ? "" :  ` &8| &c${fn(totalMaster)}`
            compHover += `\n&aTotal: &e${fn(totalNormal + totalMaster)}`
            
            let secretsHover = `&e&nSecrets\n` +
            `&aTotal: &e${fn(secretsFound)}\n` +
            `&aSecrets/Run: &e${parseInt((secretsFound / (totalNormal + totalMaster)) * 100)/100}`
            const getTimes = (key) => {
                let str = ""
                for (let floor = 1; floor <= 7; floor++) {
                    let norm = Object.keys(cata).includes(key) ? cata[key][floor] == undefined ? null : cata[key][floor] : null
                    let masterTime = playedMM && Object.keys(master).includes(key) ? master[key][floor] == undefined ? null : master[key][floor] : null
                    let masterStr = masterTime == null ? "" : ` &8| &c${convertToPBTime(masterTime)}`
                    str += `\n&e${floor}] &a${convertToPBTime(norm)}${masterStr}`
                }
                return str
            }
            let sPlusHover = `&cS+ Runs${getTimes("fastest_time_s_plus")}`
            let sHover = `&cS Runs${getTimes("fastest_time_s")}`
            new Message(
                new TextComponent(`${nameFormatted}`).setHover("show_text", nameHover).setClick("open_url", `https://sky.shiiyu.moe/stats/${playerName}`), ` &8| `,
                new TextComponent(`&c${cataLevelStr}`).setHover("show_text", cataHover), ` &8| `,
                new TextComponent(`&e${fn(secretsFound)}`).setHover("show_text", secretsHover), ` &8| `,
                new TextComponent(`&cCompletions`).setHover("show_text", compHover), ` &8| `,
                new TextComponent(`&cS+`).setHover("show_text", sPlusHover), ` &8| `,
                new TextComponent(`&cS`).setHover("show_text", sHover)
            ).chat()
        }).catch(e => `${prefix} &cError getting Dungeon Stats for ${player}: ${e}`)
    }).catch(error => {
        ChatLib.chat(`${prefix} &cError getting Dungeon Stats for ${player}: ${error}`)
    })
}).setName("ds")
