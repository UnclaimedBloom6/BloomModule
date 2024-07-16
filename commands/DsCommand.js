import Party from "../../BloomCore/Party"
import { catacombs } from "../../BloomCore/skills/catacombs"
import { getHypixelPlayer, getHypixelPlayerV2, getMojangInfo, getPlayerUUID, getProfileByID, getRecentProfile, getSelectedProfileV2 } from "../../BloomCore/utils/APIWrappers"
import { bcData, calcSkillLevel, convertToPBTime, fn, getRank } from "../../BloomCore/utils/Utils"
import Promise from "../../PromiseV2"
import { prefix } from "../utils/Utils"
import {getMpInfo, getSpiritPetStatus, getGdragStatus, getSelectedArrows, getSbLevelInfo} from "../utils/ProfileInfoCommons"
import Config from "../Config"

function rightpadNumber(str, len) {
    if (str.length >= len) return str
    if (len - str.length > 2) len += 1
    return str + " ".repeat(len - str.length)
}

const invisComma = "&0,"
const columnSeparator = ` &8| `;

export const dsCommand = register("command", (player) => {
    if (!bcData.apiKey) return ChatLib.chat(`${prefix} &cError: API Key not set! Set it with &b/bl setkey <key>`)
    if (player == "p") {
        ChatLib.chat(`${prefix} &aRunning /ds on all party members...`)
        Object.keys(Party.members).filter(a => a !== Player.getName()).forEach(a => ChatLib.command(`ds ${a}`, true))
        return
    }
	if (!player) player = Player.getName()

	getPlayerUUID(player).then(uuid => {
        Promise.all([
            getHypixelPlayerV2(uuid),
            getSelectedProfileV2(uuid)
        ]).then(values => {
            let [playerInfo, sbProfile] = values

            if (!playerInfo) return ChatLib.chat(`${prefix} &cCouldn't get player info for ${player}`)
            if (!sbProfile) return ChatLib.chat(`${prefix} &cCouldn't get ${player}'s Skyblock profile!`)
            
            const playerName = playerInfo.player.displayname
            let nameFormatted = `${getRank(playerInfo)} ${playerName}&r`
            let profileName = sbProfile["cute_name"]
            if (!sbProfile.members[uuid]) return ChatLib.chat(`${prefix} &cCouldn't get ${player}'s Skyblock profile!`);
            sbProfile.members[uuid].banking = sbProfile.banking
            sbProfile = sbProfile.members[uuid];
            
            if (!Object.keys(sbProfile.dungeons.dungeon_types.catacombs).length) return ChatLib.chat(`${prefix} &c${playerName} has never entered the Catacombs!`)
            const secretsFound = playerInfo.player?.achievements?.skyblock_treasure_hunter || 0
            const profileSecrets = sbProfile?.dungeons?.secrets || 0
            
            let dung = sbProfile.dungeons
            let master = sbProfile.dungeons.dungeon_types.master_catacombs ?? null
            let cata = sbProfile.dungeons.dungeon_types.catacombs
            
            let selectedClass = dung.selected_dungeon_class
    
            const prettify = (level) => level == 120 ? `&b&l${level}` : level >= 50 ? `&6&l${level}` : `${level}`
            
            let cataXP = Math.floor(cata["experience"])
            let cataLevel = calcSkillLevel("catacombs", cataXP)
            let cataLevelInt = Math.floor(cataLevel)
            let cataLevelStr = prettify(cataLevel)
            let cataLow = cataLevel > 50 ? 50 : cataLevelInt
        
            
            const classWithSymbols = {
                "mage":"⚚ Mage",
                "healer":"☤ Healer",
                "archer":"➶ Archer",
                "tank":"። Tank",
                "berserk":"⚔ Berserk"
            }
            
            let nameHover = `${nameFormatted} &a- &e${profileName}`
            let classLvls = []
            Object.keys(dung.player_classes).forEach(classs => {
                let classXP = parseInt(dung.player_classes[classs].experience)
                let classLvl = calcSkillLevel(classs, classXP)
                classLvls.push(classLvl)
                let xpCurr = classLvl >= 50 ? (classXP - catacombs[50])%2e8 : parseInt(classXP - catacombs[parseInt(classLvl)])
                let xpNext = classLvl >= 50 ? 2e8 : catacombs[parseInt(classLvl)+1] - catacombs[parseInt(classLvl)] || 0
                nameHover += `\n${classs == selectedClass ? "&a" : "&c"}${classWithSymbols[classs]} - &e${prettify(classLvl)}    &a(&6${fn(xpCurr)}&a/&6${fn(xpNext)}&a)`
                
            })
            let classAverage = Math.round(classLvls.reduce((a, b) => a + b) / classLvls.length * 100) / 100
            nameHover += `\n\n&cClass Average: ` + (classAverage == 50 ? `&6&l${classAverage}` : `&e${classAverage}`)
            nameHover += `\n\n&d&lSkyCrypt &7(Click)\n&ahttps://sky.shiiyu.moe/stats/${playerName}`

            let xpNext = catacombs[cataLow+1] - catacombs[cataLow]
            xpNext = isNaN(xpNext) ? 0 : xpNext
            let percentTo50 = Math.floor(cataXP / catacombs[catacombs.length - 1] * 10000) / 100

            let cataHover = `&e&nCatacombs\n` +
                `&bTotal XP: &6${fn(cataXP)}\n` +
                `&aProgress: &6${fn(cataXP - catacombs[cataLow])}&a/&6${fn(xpNext)}\n` +
                (cataLevel < 50 ? `&eRemaining: &6${fn(Math.floor(catacombs[cataLow+1] - cataXP) || 0)}\n` : "") +
                `&dPercent To 50: &6${percentTo50}%`

            if (cataLevel > 50) cataHover += `\n&cProgress: &6${fn((cataXP - catacombs[50])%2e8)}&c/&6200,000,000`

            let totalNormal = 0
            let totalMaster = 0
            const getCompHover = () => {
                const timeKey = "fastest_time_s_plus"

                let normalComps = [];
                let mmComps = [];
                let normalPbs = [];
                let mmPbs = [];
                let str = "&cCompletions" + columnSeparator + "&cS+"
                for (let floor = 1; floor <= 7; floor++) {
                    let comps = cata["tier_completions"][floor] == undefined ? 0 : cata["tier_completions"][floor]
                    let masterComps = master && master["tier_completions"][floor] == undefined ? 0 : master["tier_completions"][floor]
                    normalComps.push(comps);
                    mmComps.push(masterComps)

                    totalNormal += comps
                    totalMaster += masterComps == "" ? 0 : masterComps

                    let normalTime = timeKey in cata ? cata[timeKey][floor] == undefined ? null : cata[timeKey][floor] : null
                    let masterTime = master && timeKey in master ? master[timeKey][floor] == undefined ? null : master[timeKey][floor] : null
                    normalPbs.push(normalTime)
                    mmPbs.push(masterTime)
                }

                const maxNormalLength = fn(normalComps.reduce((a, b) => a > b ? a : b))?.length ?? 0
                const maxMasterLength = fn(mmComps.reduce((a, b) => a > b ? a : b))?.length ?? 0
                const maxNormalPbLength = normalPbs.reduce((a, b) => a > b ? a : b)?.toString()?.length ?? 0
                const maxMasterPbLength = mmPbs.reduce((a, b) => a > b ? a : b)?.toString()?.length ?? 0
                
                for(let floor = 0; floor <= 6; floor++) {
                    let normalTime = normalPbs[floor]
                    let masterTime = mmPbs[floor]

                    str += `\n&e${floor+1}] &a${
                        rightpadNumber(fn(normalComps[floor]),maxNormalLength) + (normalComps[floor] < 1000 && maxNormalLength>4 ? invisComma : "")
                    }`
                    str += " &8- "
                    if (!normalTime) {
                        str += "&80:00"
                    } else {
                        str += `&a${
                            convertToPBTime(normalTime)
                            + (maxNormalPbLength > 3 && normalTime < 600 ? " " : "")
                        }`
                    }

                    str += columnSeparator

                    str += `&c${
                        rightpadNumber(fn(mmComps[floor]),maxMasterLength)
                        + (mmComps[floor] < 1000 && maxMasterLength > 4 ? invisComma : "")}`
                    str += " &8- "
                    if (!masterTime) {
                        str += "&80:00"
                    } else {
                        str += `&c${
                            convertToPBTime(masterTime)
                            + (maxMasterPbLength > 3 && masterTime < 600 ? " " : "")
                        }`
                    }

                }
                str += `\n&a${fn(totalNormal)}${columnSeparator}&c${fn(totalMaster)}`
                str += `\n&aTotal: &e${fn(totalNormal + totalMaster)}`
                return str;
            }
            
            let compHover = getCompHover()
            
            let secretsHover = `&e&nSecrets\n` +
            `&aTotal: &e${fn(secretsFound)}\n` +
            (profileSecrets && profileSecrets !== secretsFound ? `&aProfile: &e${fn(profileSecrets)}\n` : "") +
            `&aSecrets/Run: &e${(secretsFound / (totalNormal + totalMaster)).toFixed(2)}`

            const {mp,mpHover} = getMpInfo(sbProfile)

            let extraComponents = [];

            if (!Config.advancedDS) {
                extraComponents = [columnSeparator,new TextComponent(`&cMP: &e${fn(mp)}`).setHover("show_text", mpHover)];
            } else {
                const getTimes = (key) => {
                    let str = ""
                    for (let floor = 1; floor <= 7; floor++) {
                        let normalTime = key in cata ? cata[key][floor] == undefined ? null : cata[key][floor] : null
                        let masterTime = master && key in master ? master[key][floor] == undefined ? null : master[key][floor] : null
                        
                        let masterStr = masterTime == null ? "" : ` &8| &c${convertToPBTime(masterTime)}`
                        str += `\n&e${floor}] &a${convertToPBTime(normalTime)}${masterStr}`
                    }
                    return str
                }

                extraComponents = [
                    columnSeparator,new TextComponent(`&cS+`).setHover("show_text", `&cS+ Runs${getTimes("fastest_time_s_plus")}`),
                    columnSeparator,new TextComponent(`&cS`).setHover("show_text", `&cS Runs${getTimes("fastest_time_s")}`),
                    "\n",
                    new TextComponent(`&cMP: &e${fn(mp)}`).setHover("show_text", mpHover),columnSeparator
                ];

                extraComponents.push(new TextComponent(getSbLevelInfo(sbProfile)), columnSeparator)

                const {spirit,spiritText} = getSpiritPetStatus(sbProfile)
                extraComponents.push( new TextComponent(spiritText).setHover("show_text",`&cSpirit pet: ${ spirit ? "&aYes" : "&cNo" }`), columnSeparator)

                const {gdragText,gdragHover} = getGdragStatus(sbProfile)
                extraComponents.push( new TextComponent(gdragText).setHover("show_text",gdragHover), columnSeparator)

                extraComponents.push(new TextComponent(getSelectedArrows(sbProfile)))
            }

            new Message(
                new TextComponent(`${nameFormatted}`).setHover("show_text", nameHover).setClick("open_url", `https://sky.shiiyu.moe/stats/${playerName}`), columnSeparator,
                new TextComponent(`&c${cataLevelStr}`).setHover("show_text", cataHover), columnSeparator,
                new TextComponent(`&e${fn(secretsFound)}`).setHover("show_text", secretsHover), columnSeparator,
                new TextComponent(`&cRuns`).setHover("show_text", compHover),
                ...extraComponents
                // new TextComponent(`&cS`).setHover("show_text", sHover), columnSeparator,
            ).chat()

        }).catch(e => ChatLib.chat(`${prefix} &cError getting Dungeon Stats for ${player}: ${e}`))
    }).catch(error => {
        ChatLib.chat(`${prefix} &cError getting Dungeon Stats for ${player}: ${error}`)
    })
}).setName("ds")
