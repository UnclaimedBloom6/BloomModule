import { getHypixelPlayer, getMojangInfo, getRecentProfile } from "../../BloomCore/utils/APIWrappers"
import { bcData, calcSkillLevel, fn, getRank } from "../../BloomCore/utils/Utils"
import Promise from "../../PromiseV2"
import { prefix } from "../utils/Utils"

export const dcCommand = register("command", (player1, player2) => {
    if (!player1 || !player2) return ChatLib.chat(`&c/dc <player1> <player2> - Show the difference in catacombs experience between two players.`)
    Promise.all([
        getMojangInfo(player1),
        getMojangInfo(player2)
    ]).then(mi => {
        let [p1UUID, p1Name] = [mi[0].id, mi[0].name]
        let [p2UUID, p2Name] = [mi[1].id, mi[1].name]
        Promise.all([
            getRecentProfile(p1UUID, null, bcData.apiKey),
            getHypixelPlayer(p1UUID, bcData.apiKey),
            getRecentProfile(p2UUID, null, bcData.apiKey),
            getHypixelPlayer(p2UUID, bcData.apiKey)
        ]).then(data => {
            let [p1Profile, p1Stats, p2Profile, p2Stats] = data
            if (!p1Profile || !p1Stats) return ChatLib.chat(`&cUnable to get stats for ${p1Name}`)
            if (!p2Profile || !p2Stats) return ChatLib.chat(`&cUnable to get stats for ${p2Name}`)
            const colorCataLevel = (cataLevel) => cataLevel == 120 ? `&b&l${cataLevel}` : cataLevel >= 50 ? `&6&l${cataLevel}` : `&c${cataLevel}`
            let p1CataXP = p1Profile.members[p1UUID].dungeons.dungeon_types.catacombs.experience
            let p1Rank = getRank(p1Stats)
            let p2CataXP = p2Profile.members[p2UUID].dungeons.dungeon_types.catacombs.experience
            let p2Rank = getRank(p2Stats)
            let diff = Math.abs(p1CataXP - p2CataXP)
            ChatLib.chat(`&6${fn(parseInt(diff))} &aCata XP from ${p1Rank} ${p1Name} &a(${colorCataLevel(calcSkillLevel("catacombs", p1CataXP))}&a) to ${p2Rank} ${p2Name} &a(${colorCataLevel(calcSkillLevel("catacombs", p2CataXP))}&a).`)
        }).catch(e => ChatLib.chat(e))
    }).catch(e => ChatLib.chat(`${prefix} &cInvalid Player`))
}).setName("dc")