import { getHypixelPlayer, getMojangInfo, getRecentProfile } from "../../BloomCore/utils/APIWrappers"
import { bcData, fn, getRank } from "../../BloomCore/utils/Utils"

const kuudraTiers = {
    "none": "&8Basic",
    "hot": "&7Hot",
    "burning": "&eBurning",
    "fiery": "&cFiery",
    "infernal": "&4Infernal"
}

export const kuudraCommand = register("command", (player) => {
    getMojangInfo(player).then(mojangInfo => {
        if (!mojangInfo) return ChatLib.chat(`&cError: Not a real player!`)
        let {name, id} = mojangInfo
        getHypixelPlayer(id, bcData.apiKey).then(hypixelInfo => {
            let rank = getRank(hypixelInfo)
            getRecentProfile(id, null, bcData.apiKey).then(profile => {
                let data = profile.members[id].nether_island_player_data.kuudra_completed_tiers
                let totalComps = 0
                
                // Add PBs to api pls Hypixel ):

                let hoverStr = Object.keys(kuudraTiers).reduce((a, b) => {
                    if (!(b in data)) return a
                    a += `\n${kuudraTiers[b]}&f: &a${fn(data[b])}`
                    totalComps += data[b]
                    // let high = `highest_wave_${b}`
                    // if (!(high in data)) return a
                    // a += `\n   &7Highest Wave: ${data[high]}`
                    return a
                }, "&eKuudra Completions")
                let skyCrypt = `https://sky.shiiyu.moe/stats/${name}`
                new Message(
                    new TextComponent(`${rank} ${name}`).setHover("show_text", `&d${skyCrypt}`).setClick("open_url", skyCrypt),
                    " &8| ",
                    new TextComponent(`&aTotal Completions: &e${totalComps}`).setHover("show_text", hoverStr)
                ).chat()
            }).catch(e => ChatLib.chat(`&cError: ${e}`))
        }).catch(e => ChatLib.chat(`&cError: ${e}`))
    }).catch(e => ChatLib.chat(`&cError: ${e}`))
}).setName("kuudra")