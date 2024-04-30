import { getGuildInfo, getHypixelPlayer, getMojangInfo } from "../../BloomCore/utils/APIWrappers"
import { bcData, fn, getRank, monthsShort } from "../../BloomCore/utils/Utils"
import Promise from "../../PromiseV2"
import { prefix } from "../utils/Utils"

// let chatIncrement = 5645

export const memberCommand = register("command", (player) => {
	if (!player) player = Player.getName()
	// chatIncrement++
	// let currentChat = chatIncrement
	new Message(`${prefix} &aGetting guild stats for &2${player}&a...`).chat()
	getMojangInfo(player).then(mojangInfo => {
        if (!mojangInfo) return new Message(`${prefix} &cError: That player does not exist!`).chat()
        let uuid = mojangInfo.id
        player = mojangInfo.name
		// ChatLib.editChat(currentChat, new Message(`${prefix} &aGetting Guild Info...`).setChatLineId(currentChat))
        Promise.all([
            getHypixelPlayer(uuid, bcData.apiKey),
            getGuildInfo(player, bcData.apiKey)
        ]).then(values => {
            let [playerInfo, guildInfo] = values
            let nameFormatted = `${getRank(playerInfo)} ${player}&r`
            if (!guildInfo.guild) return ChatLib.chat(`&cError: ${nameFormatted} &cis not currently in a guild!`)
            
            let guildName = guildInfo.name
            let tag = guildInfo.tag_formatted
            let guildLevel = guildInfo.level
            let totalXP = guildInfo.exp
            let joinable = guildInfo.joinable ? "Yes" : "No"
            let isPublic = guildInfo.public ? "Yes" : "No"
            let created = new Date(guildInfo.created)
            
            let weeklyGexp
            let joined
            let memberDays
            let guildRank
            let gexpHover = "&e&nDaily GEXP"
            guildInfo.members.forEach(member => {
                if (member.uuid !== uuid) return
                weeklyGexp = Object.values(member["exp_history"]).reduce((a, b) => a + b)
                joined = new Date(member["joined"])
                guildRank = member["rank"]
                memberDays = parseInt((Date.now() - member["joined"]) / 1000 / 60 / 60 / 24)
                Object.keys(member["exp_history"]).forEach(day => {
                    gexpHover += `\n&a${day} - &2${fn(member["exp_history"][day])}`
                })
            })
            
            let nameHover = `&aGuild Rank: &e${guildRank}`
            const get24h = (date) => {
                let hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
                let mins = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
                return `${hours}:${mins}`
            }
            let joinedHover = `&e&nJoined:\n&a${joined.getDate()} ${monthsShort[joined.getMonth()]}, ${joined.getFullYear()} - ${get24h(joined)}`
            // ChatLib.clearChat(currentChat)
            
            let guildHover = "&e&nGuild Info" +
                `\n&aGuild Name: &e${guildName}` +
                `\n&aGuild Tag: &e${tag}` +
                `\n&aGuild Level: &e${guildLevel}` +
                `\n&aGuild Members: &e${guildInfo["members"].length}` +
                `\n&aTotal XP: &e${fn(totalXP)}` +
                `\n&aJoinable: &e${joinable}` +
                `\n&aPublic: &e${isPublic}` +
                `\n&aCreated: &e${created.getDate()} ${monthsShort[created.getMonth()]}, ${created.getFullYear()} - ${get24h(created)}`
                
            new Message(
                new TextComponent(nameFormatted).setHover("show_text", nameHover), ` &8| `,
                new TextComponent(`&a${fn(weeklyGexp)} GEXP`).setHover("show_text", gexpHover), ` &8| `,
                new TextComponent(`&e${fn(memberDays)} days`).setHover("show_text", joinedHover), ` &8| `,
                new TextComponent(`&a${guildName}`).setHover("show_text", guildHover).setClick("open_url", `https://plancke.io/hypixel/guild/name/${guildName.replace(new RegExp(" ", "g"), "%20")}`)
            ).chat()
        }).catch(e => ChatLib.chat(e))
    }).catch(e => ChatLib.chat(e))
}).setName("mem")
