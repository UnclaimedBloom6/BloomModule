import { maxLevels, normalSkill } from "../../BloomCore/skills/normal";
import { getHypixelPlayer, getMojangInfo, getRecentProfile } from "../../BloomCore/utils/APIWrappers";
import { bcData, calcSkillLevel, fn, getRank, title } from "../../BloomCore/utils/Utils";
import Promise from "../../PromiseV2";
import { prefix } from "../utils/Utils";

export const skillsCommand = register("command", (player) => {
    if (!bcData.apiKey) return ChatLib.chat(`${prefix} &cError: API Key not set! Set it with &b/bl setkey <key>`)
    if (!player) player = Player.getName()
    let msg = new Message(`${prefix} &aGetting skills for ${player}...`).chat()
    getMojangInfo(player).then(mojangInfo => {
        let [player, uuid] = [mojangInfo.name, mojangInfo.id]
        Promise.all([
            getRecentProfile(uuid, null, bcData.apiKey),
            getHypixelPlayer(uuid, bcData.apiKey)
        ]).then(values => {
            let [profile, hypixelPlayer] = values
            let rank = getRank(hypixelPlayer)
            let stats = profile["members"][uuid]
            let skills = {
                "taming": stats["experience_skill_taming"],
                "farming": stats["experience_skill_farming"],
                "mining": stats["experience_skill_mining"],
                "combat": stats["experience_skill_combat"],
                "foraging": stats["experience_skill_foraging"],
                "fishing": stats["experience_skill_fishing"],
                "enchanting": stats["experience_skill_enchanting"],
                "alchemy": stats["experience_skill_alchemy"]
            }

            let skillAverage = Object.keys(skills).map(s => Math.floor(calcSkillLevel(s, skills[s]))).reduce((a, b) => a + b, 0) / Object.keys(skills).length
            let hoverStr = skillAverage == 55 ? `&6&lSkill Average: ${skillAverage}\n` : `&bSkill Average: ${skillAverage}\n`
            for (let skill of Object.keys(skills)) {
                skills[skill] = skills[skill] ? parseInt(skills[skill]) : 0
                let skillLevel = calcSkillLevel(skill, skills[skill])
                let sc = "&a"
                if (skillLevel == maxLevels[skill]) sc = "&6&l"
                let isMax = maxLevels[skill] == skillLevel
                let xpCurr = normalSkill[parseInt(skillLevel)]
                let xpNext = normalSkill[parseInt(skillLevel)+1]
                hoverStr += `${sc}${title(skill)} ${skillLevel} - ${fn(skills[skill])} xp\n`
                hoverStr += ` &a-> &e${fn(xpCurr)}&a/&e${!isMax ? fn(xpNext) : 0} &a(&d${isMax ? "MAX" : fn(xpNext - skills[skill])}&a)`

                if (skill !== Object.keys(skills).reverse()[0]) hoverStr += "\n\n" // Don't add a new line if it is the last skill
            }
            new Message(new TextComponent(`${prefix} &aSkills for ${rank} ${player} &7(Hover)`).setHover("show_text", hoverStr)).chat()
        })
    })
}).setName("/skills")
