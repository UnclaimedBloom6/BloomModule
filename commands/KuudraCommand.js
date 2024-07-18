import { getHypixelPlayer, getMojangInfo, getRecentProfile, getSelectedProfileV2 } from "../../BloomCore/utils/APIWrappers"
import { bcData, fn, getRank } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"
import Party from "../../BloomCore/Party"
import { hidePartySpam } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import {getMpInfo, getGdragStatus, getSelectedArrows, getSbLevelInfo } from "../utils/ProfileInfoCommons"

const kuudraTiers = {
    "none": "&8Basic",
    "hot": "&7Hot",
    "burning": "&eBurning",
    "fiery": "&cFiery",
    "infernal": "&4Infernal"
}
const columnSeparator = ` &8| `;

export const kuudraCommand = register("command", (player) => {
    kuudraCommandExec(player)
}).setName("/kuudra")

function kuudraCommandExec(player) {
    if (player == "p") {
        ChatLib.chat(`${prefix} &aRunning //kuudra on all party members...`)
        Object.keys(Party.members).filter(a => a !== Player.getName()).forEach(a => kuudraCommandExec(a))
        return
    }
    if (!player) player = Player.getName()
	
    
    getMojangInfo(player).then(mojangInfo => {
        if (!mojangInfo) return ChatLib.chat(`&cError: Not a real player!`)
        let {name, id} = mojangInfo
        getHypixelPlayer(id, bcData.apiKey).then((hypixelInfo) => {
            let rank = getRank(hypixelInfo)
			getSelectedProfileV2(id).then(profile => {
					let data = profile.members[id].nether_island_player_data.kuudra_completed_tiers
					let totalComps = 0
					let collection = 0
					
					// Add PBs to api pls Hypixel ):
					let hoverStr = Object.keys(kuudraTiers).reduce((a, b, i) => {
						if (!(b in data)) return a
						a += `\n${kuudraTiers[b]}&f: &a${fn(data[b])}`
						totalComps += data[b]
						collection += (i+1) * data[b]
						// let high = `highest_wave_${b}`
						// if (!(high in data)) return a
						// a += `\n   &7Highest Wave: ${data[high]}`
						return a
					}, "&eKuudra Completions")
					let skyCrypt = `https://sky.shiiyu.moe/stats/${name}`

                    let extraComponents = [];

                    if (data["infernal"]) {
                        extraComponents.push(columnSeparator,new TextComponent(`&aT5 comps: &e${fn(data["infernal"])}`).setHover("show_text", `&e${fn(collection)} Collection`))
                    }

                    if (Config.advancedDS) {
                        const sbProfile = profile.members[id]
                        const {mp,mpHover} = getMpInfo(sbProfile)
                        extraComponents.push(
                            "\n",
                            new TextComponent(`&cMP: &e${fn(mp)}`).setHover("show_text", mpHover),columnSeparator
                        )
                        extraComponents.push(new TextComponent(getSbLevelInfo(sbProfile)), columnSeparator)

                        const {gdragText,gdragHover} = getGdragStatus(sbProfile)
                        extraComponents.push( new TextComponent(gdragText).setHover("show_text",gdragHover), columnSeparator)
                        
                        extraComponents.push(new TextComponent(getSelectedArrows(sbProfile)))
                    }

					new Message(
						new TextComponent(`${rank} ${name}`).setHover("show_text", `&d${skyCrypt}`).setClick("open_url", skyCrypt),
						columnSeparator,
						new TextComponent(`&aCompletions: &e${totalComps}`).setHover("show_text", hoverStr),
                        ...extraComponents
					).chat()

			}).catch(e => ChatLib.chat(`&cError: ${e}`))
        }).catch(e => ChatLib.chat(`&cError: ${e}`))
    }).catch(e => ChatLib.chat(`&cError: ${e}`))
}

// Auto DS 
register("chat", (player, combatLevel) => {
	if (player === Player.getName()) {
        if (!Config.autoDSParty) return;
        
		new Thread(() => {
			hidePartySpam(750)
			ChatLib.command("pl")
			Thread.sleep(750)
			kuudraCommandExec(p)
		}).start()

        return
	}

    if (Config.autoDS) kuudraCommandExec(player)

}).setChatCriteria(/^Party Finder > (\w{1,16}) joined the group! \(Combat Level (\d+)\)$/)