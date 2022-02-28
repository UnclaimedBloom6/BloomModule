import { prefix, calcSkillLevel, data, fn, getMojangInfo, getRecentProfile, getSbProfiles, getSlothPixelPlayer, title } from "../utils/Utils";
import { maxLevels, normalSkill } from "../utils/SkillsProgression";

export const skillsCommand = register("command", (player) => {
    if (!data.apiKey) return ChatLib.chat(`${prefix} &cError: API Key not set! Set it with &b/bl setkey <key>`)
    if (!player) player = Player.getName()
    new Message(`${prefix} &aGetting skills for ${player}...`).setChatLineId(65443).chat()
    getMojangInfo(player).then(mojangInfo => {
        mojangInfo = JSON.parse(mojangInfo)
        let uuid = mojangInfo.id
        player = mojangInfo.name
        getSbProfiles(uuid).then(profiles => {
            let profile = getRecentProfile(JSON.parse(profiles), uuid)
            getSlothPixelPlayer(player).then(slothPixel => {
                slothPixel = JSON.parse(slothPixel)
                let rank = slothPixel.rank_formatted

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

                ChatLib.editChat(65443, new Message(new TextComponent(`${prefix} &aSkills for ${rank} ${player} &7(Hover)`).setHover("show_text", hoverStr)))
            }).catch(error => {
                ChatLib.chat(`3 ${error}`)
            })
        }).catch(error => {
            ChatLib.chat(`2 ${error}`)
        })
    }).catch(error => {
        ChatLib.chat(`1 ${error}`)
    })
}).setName("skills")