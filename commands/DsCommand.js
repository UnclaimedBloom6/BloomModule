import { catacombs } from "../../BloomCore/skills/catacombs"
import { getHypixelPlayerV2, getPlayerUUID, getSkyblockProfilesV2 } from "../../BloomCore/utils/APIWrappers"
import { bcData, calcSkillLevel, convertToPBTime, fn, getRank, title, unzipGzipData } from "../../BloomCore/utils/Utils"
import Promise from "../../PromiseV2"
import { prefix } from "../utils/Utils"
import {getMpInfo, getSpiritPetStatus, getGdragStatus, getSelectedArrows, getSbLevelInfo, classWithSymbols} from "../utils/ProfileInfoCommons"
import Config from "../Config"
import PartyV2 from "../../BloomCore/PartyV2"
import { getHypixelPlayer, requestPlayerUUID } from "../../BloomCore/utils/ApiWrappers2"

const invisComma = "&0,"
const columnSeparator = ` &8| `
const runTableSeparator = ` &b| `

const prettifyLevel = (level) => level == 100 ? `&b&l${level}` : level >= 50 ? `&6&l${level}` : `${level}`

const padWithCommas = (string, maxLength) => {
    const toAdd = Math.floor((maxLength - Renderer.getStringWidth(string)) / Renderer.getStringWidth(invisComma))
    return string + invisComma.repeat(toAdd < 0 ? 0 : toAdd)
}

/**
 * Inserts black commas at the end of each string in the array until they are all equal length
 * @param {String[]} stringsArr 
 * @returns {String[]}
 */
const padStrings = (stringsArr) => {
    const maxLength = Math.max(...stringsArr.map(v => Renderer.getStringWidth(v)))

    return stringsArr.map(v => padWithCommas(v, maxLength))

}

const getFormattedTime = (timeMs, isMM) => {
    if (!timeMs) return "&8??:??"

    const formatted = convertToPBTime(timeMs)

    if (isMM) return "&c" + formatted
    return "&a" + formatted
}

const getFormattedComps = (comps, isMM) => {
    if (!comps) return "&80"
    
    if (isMM) return "&c" + fn(comps)
    return "&a" + fn(comps)
}

// |   Comps    |     S+     |      S      |
// 1] 46   9    | 2:08  2:19 | 2:28  ??:?? |
// 2] 56   4    | 2:20  5:11 | 2:09  3:30  |
// 3] 1    24   | ??:?? 3:34 | ??:?? 2:37  |
// 4] 22   2    | 4:14  4:26 | 3:17  6:31  |
// 5] 4589 1138 | 1:41  1:41 | 2:03  2:04  |
// 6] 504  272  | 2:31  2:27 | 2:49  2:34  |
// 7] 385  1    | 4:16  9:16 | 4:26  ??:?? |

const getCompInfo = (dungeonObject) => {
    const { matrix, normalComps, masterComps } = createCompMatrix(dungeonObject)
    const totalComps = normalComps + masterComps
    
    const finalArr = new Array(8).fill("") // 8 instead of 7 because of the column titles
    
    const colTitles = ["&eComps", "&eS+", "&eS"]

    // Go by columns first instead of rows since we need to build the strings from left to right
    for (let col = 0; col < matrix[0].length; col++) {
        // Get all of the strings for this column and pad them
        let paddedStrings = padStrings(matrix.map(v => v[col]))

        for (let i = 0; i < paddedStrings.length; i++) {
            // Insert the floor number into the start of the line
            if (col == 0) finalArr[i+1] += `&e${i+1}] `

            // Separator every two columns
            if (col % 2 == 0 && col !== 0) {
                finalArr[i+1] += runTableSeparator
            }

            // And add the data for this floor
            finalArr[i+1] += paddedStrings[i]
        }

        // Insert the title and center it in the column. This whole block is just for a centered fucking header
        if (col % 2 == 1) {
            finalArr[0] += runTableSeparator
            
            let title = colTitles.shift()
            let titleWidth = Renderer.getStringWidth(title)
            let existingWidth = Renderer.getStringWidth(finalArr[0]) // How long the top line is already
            let maxWidth = Math.max(...finalArr.map(a => Renderer.getStringWidth(a))) // The target width
            
            // How much space should be taken up by commas in total on L + R
            let spaceToFill = maxWidth - existingWidth - titleWidth
            // Amount of comma space each side
            let sideSpace = Math.ceil(spaceToFill / 2)
            
            // Insert the centered column title
            finalArr[0] = padWithCommas(finalArr[0], existingWidth + sideSpace)
            finalArr[0] += title
            finalArr[0] = padWithCommas(finalArr[0], maxWidth)
        }
    }

    // Combine the string and add the total completions at the bottom of it
    let compHover = finalArr.join("\n")
    compHover += `\n&aCompletions: &a${fn(normalComps)} &8| &c${fn(masterComps)}`
    compHover += `\n&aOverall: &e${fn(totalComps)}`

    return {
        compHover,
        normalComps,
        masterComps
    }
}

/**
 * Final result will be a 6x7 matrix of all strings
 * [
 *     [NORMAL_COMP, MM_COMP, NORM_S_PLUS_PB, MM_S_PLUS_PB, NORM_S_PB, MM_S_PB], // Floor 1
 *     [NORMAL_COMP, MM_COMP, NORM_S_PLUS_PB, MM_S_PLUS_PB, NORM_S_PB, MM_S_PB], // Floor 2
 *     [] ... // 3
 *     [] ... // 4
 *     [] ... // 5
 *     [] ... // 6
 *     [] ... // 6
 * ]
 * @param {Object} dungeonDataObj - Object containing the matrix, normal comps, and mm comps
 */
const createCompMatrix = (dungeonDataObj) => {

    const matrix = new Array(7).fill(null) // Create a 6x7 matrix of nulls
    matrix.forEach((_, i) => matrix[i] = new Array(6).fill(null))
    
    const normal = dungeonDataObj.dungeon_types.catacombs
    const mm = dungeonDataObj.dungeon_types.master_catacombs

    let normalComps = 0
    let masterComps = 0

    // Start populating the matrix
    for (let floorIndex = 0; floorIndex < matrix.length; floorIndex++) {
        // Stats for this floor get inserted into the matrix
        // I fucking hate this
        let normComps = (normal && "tier_completions" in normal ? normal.tier_completions[floorIndex+1] : null) ?? 0
        let mmComps = (mm && "tier_completions" in mm ? mm.tier_completions[floorIndex+1] : null) ?? 0
        matrix[floorIndex][0] = `&a${getFormattedComps(normComps)}  `
        matrix[floorIndex][1] = `&c${getFormattedComps(mmComps, true)} `
        normalComps += normComps
        masterComps += mmComps
        
        let normSPlus = (normal && "fastest_time_s_plus" in normal ? normal.fastest_time_s_plus[floorIndex+1] : null) ?? 0
        let mmSPlus = (mm && "fastest_time_s_plus" in mm ? mm.fastest_time_s_plus[floorIndex+1] : null) ?? 0
        matrix[floorIndex][2] = `&a${getFormattedTime(normSPlus)}  `
        matrix[floorIndex][3] = `&c${getFormattedTime(mmSPlus, true)} `
        
        let normS = (normal && "fastest_time_s" in normal ? normal.fastest_time_s[floorIndex+1] : null) ?? 0
        let mmS = (mm && "fastest_time_s" in mm ? mm.fastest_time_s[floorIndex+1] : null) ?? 0
        matrix[floorIndex][4] = `&a${getFormattedTime(normS)}  `
        matrix[floorIndex][5] = `&c${getFormattedTime(mmS, true)} `
    }

    return {
        matrix,
        normalComps,
        masterComps
    }
}

const createInventoryComponent = (sbProfile) => {
    const noData = new TextComponent("&cItems").setHover("show_text", "&cNo inv data")
    
    const armorData = unzipGzipData(sbProfile?.inventory?.inv_armor?.data)
    const invData = unzipGzipData(sbProfile?.inventory?.inv_contents?.data)

    if (!unzipGzipData || !invData) return noData

    const armorContents = armorData.toObject()
    const invContents = invData.toObject()

    if (!armorContents || !invContents) return noData

    const armorArray = armorContents.i.map(v => {
        if (!v) return "&8Empty"

        return v?.tag?.display?.Name ?? "&8Empty"
    }).reverse()

    const hotbarArray = invContents.i.slice(0, 8).map(v => {
        if (!v) return "&8Empty"

        return v?.tag?.display?.Name ?? "&8Empty"
    })

    let finalHover = "&aInventory Contents\n" + 
        "&b&nArmor:\n" +
        armorArray.join("\n") + 
        "\n\n&b&nHotbar:\n" + 
        hotbarArray.join("\n")

    return new TextComponent("&aItems").setHover("show_text", finalHover)

}

const gamemodeColors = {
    ironman: "&7",
    bingo: "&c",
    stranded: "&a"
}

register("command", (player, profilename) => {
    if (!bcData.apiKey) {
        ChatLib.chat(`${prefix} &cError: API Key not set! Set it with &b/bl setkey <key>`)
        return
    }

    if (player == "p") {
        ChatLib.chat(`${prefix} &aRunning /ds on all party members...`)
        Object.keys(PartyV2.members).forEach(a => {
            if (a == Player.getName()) {
                return
            }
            
            ChatLib.command(`ds ${a}`, true)
        })

        return
    }
    
	if (!player) {
        player = Player.getName()
    }
    
    requestPlayerUUID(player, (resp) => {
        let { success, uuid, reason } = resp

        if (!success) {
            ChatLib.chat(`&cCould not get UUID for ${player}: ${reason}`)
            return
        }

        getHypixelPlayer(uuid, resp => {
            if (!resp.success) {
                ChatLib.chat(`&cCould not get player info for ${player}:\n${resp.reason}`)
                return
            }

            const playerInfo = resp.data

            getSkyblockProfilesV2(uuid).then(sbProfiles => {
                let sbProfile = sbProfiles.profiles.find(a => a.selected)
        
                // Stats for a specific profile
                if (profilename) {
                    sbProfile = sbProfiles.profiles.find(a => {
                        return a.cute_name.toLowerCase() == profilename.toLowerCase()
                    })
        
                    if (!sbProfile) {
                        ChatLib.chat(`${prefix} &cCould not find profile: ${profilename}`)
                        return
                    }
                }
        
                const profileNames = sbProfiles.profiles.map(a => {
                    let final = ""
                    if (a.cute_name == sbProfile.cute_name) final += "&a> &r"
                    final += `&b${a.cute_name}`
        
                    if (a.game_mode) {
                        final += ` &b(${gamemodeColors[a.game_mode] || "&b"}${title(a.game_mode)}&b)`
                    }
        
                    return final
                })
        
                if (!playerInfo) return ChatLib.chat(`${prefix} &cCouldn't get player info for ${player}`)
                if (!sbProfile) return ChatLib.chat(`${prefix} &cCouldn't get ${player}'s Skyblock profile!`)
                
                const playerName = playerInfo.player.displayname
                let nameFormatted = `${getRank(playerInfo)} ${playerName}&r`
                let profileName = sbProfile["cute_name"]
        
                if (!sbProfile.members[uuid]) return ChatLib.chat(`${prefix} &cCouldn't get ${player}'s Skyblock profile!`)
        
                sbProfile.members[uuid].banking = sbProfile.banking
                sbProfile = sbProfile.members[uuid]
                
                if (!sbProfile.dungeons || !Object.keys(sbProfile.dungeons.dungeon_types.catacombs).length) {
                    return ChatLib.chat(`${prefix} &c${playerName} has never entered the Catacombs on their ${profileName} profile!`)
                }
        
                const secretsFound = playerInfo.player?.achievements?.skyblock_treasure_hunter || 0
                const profileSecrets = sbProfile?.dungeons?.secrets || 0
                
                let dung = sbProfile.dungeons
                let cata = sbProfile.dungeons.dungeon_types.catacombs
                
                let selectedClass = dung.selected_dungeon_class
        
                const cataXP = Math.floor(cata.experience ?? 0)
                const cataLevel = calcSkillLevel("catacombs", cataXP)
                const cataLevelInt = Math.floor(cataLevel)
                const cataLevelStr = prettifyLevel(cataLevel)
                const cataLow = cataLevel > 50 ? 50 : cataLevelInt
                
                let nameHover = `${nameFormatted} &a- &e${profileName}`
                let classLvls = []
                Object.entries(dung.player_classes).forEach(([classs, classData]) => {
                    let classXP = parseInt(classData.experience)
                    let classLvl = calcSkillLevel(classs, classXP)
                    classLvls.push(classLvl)
                    let xpCurr = classLvl >= 50 ? (classXP - catacombs[50])%2e8 : parseInt(classXP - catacombs[parseInt(classLvl)])
                    let xpNext = classLvl >= 50 ? 2e8 : catacombs[parseInt(classLvl)+1] - catacombs[parseInt(classLvl)] || 0
                    nameHover += `\n${classs == selectedClass ? "&a" : "&c"}${classWithSymbols[classs]} - &e${prettifyLevel(classLvl)}    &a(&6${fn(xpCurr)}&a/&6${fn(xpNext)}&a)`
                })
        
                const classAverage = (classLvls.reduce((a, b) => a + b) / classLvls.length).toFixed(2)

                nameHover += `\n\n&cClass Average: ` + (classAverage >= 50 ? `&6&l${classAverage}` : `&e${classAverage}`)
                nameHover += `\n\nProfiles:\n${profileNames.join("\n")}`
                nameHover += `\n\n&d&lSkyCrypt &7(Click)\n&ahttps://sky.shiiyu.moe/stats/${playerName}`
        
                let xpNext = catacombs[cataLow+1] - catacombs[cataLow]
                xpNext = isNaN(xpNext) ? 0 : xpNext
                let percentTo50 = Math.floor(cataXP / catacombs[catacombs.length - 1] * 10000) / 100

                let cataHover = `&e&nCatacombs\n`
                cataHover += `&bTotal XP: &6${fn(cataXP)}\n`
                
                if (cataLevel == 100) {
                    cataHover += "&b&lMAXED"
                }
                else if (cataLevel < 50) {
                    let levelProgress = cataXP - catacombs[cataLow]
                    cataHover += `&aProgress: &6${fn(levelProgress)}&a/&6${fn(xpNext)} &a(&6${(levelProgress / xpNext * 100).toFixed(2)}%&a)\n`
                    cataHover += `&eRemaining: &6${fn(Math.floor(catacombs[cataLow+1] - cataXP) || 0)}\n`
                    cataHover += `&dPercent To 50: &6${percentTo50}%`
                }
                else {
                    let levelProgress = (cataXP - catacombs[50])%2e8
                    cataHover += `&aProgress: &6${fn(levelProgress)}&a/&6200M &a(&6${(levelProgress / 2e8 * 100).toFixed(2)}%&a)`
                }
                
                const { compHover, normalComps, masterComps } = getCompInfo(dung)
        
                const { mp, mpHover } = getMpInfo(sbProfile)
        
                let secretsHover = `&e&nSecrets\n` +
                `&aTotal: &e${fn(secretsFound)}\n` +
                (profileSecrets && profileSecrets !== secretsFound ? `&aProfile: &e${fn(profileSecrets)}\n` : "") +
                `&aSecrets/Run: &e${(secretsFound / (normalComps + masterComps)).toFixed(2)}`
        
                const extraComponents = [
                    new TextComponent(`&cMP: &e${fn(mp)}`).setHover("show_text", mpHover), columnSeparator,
                    createInventoryComponent(sbProfile)
                ]
        
                if (Config.advancedDS) {
                    const { spirit, spiritText } = getSpiritPetStatus(sbProfile)
                    const { gdragText, gdragHover } = getGdragStatus(sbProfile)
                    
                    extraComponents.push(
                        "\n   ",
                        new TextComponent(getSbLevelInfo(sbProfile)),
                        columnSeparator,
                        new TextComponent(spiritText).setHover("show_text",`&cSpirit pet: ${ spirit ? "&aYes" : "&cNo" }`),
                        columnSeparator,
                        new TextComponent(gdragText).setHover("show_text", gdragHover),
                        columnSeparator,
                        new TextComponent(getSelectedArrows(sbProfile))
                    )
                }
        
                new Message(
                    new TextComponent(`${nameFormatted}`).setHover("show_text", nameHover).setClick("open_url", `https://sky.shiiyu.moe/stats/${playerName}`), columnSeparator,
                    new TextComponent(`&c${cataLevelStr}`).setHover("show_text", cataHover), columnSeparator,
                    new TextComponent(`&e${fn(secretsFound)}`).setHover("show_text", secretsHover), columnSeparator,
                    new TextComponent(`&cRuns`).setHover("show_text", compHover), columnSeparator,
                    ...extraComponents
                    // new TextComponent(`&cS`).setHover("show_text", sHover), columnSeparator,
                ).chat()
            }).catch(e => {
                ChatLib.chat(`&cCould not get Skyblock profiles for ${player}:\n${JSON.stringify(e, null, 4)}`)
            })
        })
    })
}).setTabCompletions((args) => {
    const partyNames = Object.keys(PartyV2.members)
    const worldPlayers = World.getAllPlayers()
        .filter(a => a.getUUID().version() == 4)
        .map(a => a.getName())

    const final = partyNames.concat(worldPlayers)

    if (args.length > 0) {
        const finalArg = args[args.length-1]

        return final.filter(a => a.toLowerCase().startsWith(finalArg.toLowerCase()))
    }

    return final
}).setName("ds")