import { addAllPlayersCompletion } from "../utils/TabCompletion"
import { getMojangInfo, prefix } from "../utils/Utils"
import request from "../../requestV2"

let scammerCommand = register("command", (player) => {
	if (!player) player = Player.getName()
	new Message(`${prefix} &aChecking if ${player} is a scammer...`).setChatLineId(468576858).chat()
	getMojangInfo(player).then(mojangInfo => {
		mojangInfo = JSON.parse(mojangInfo)
		player = mojangInfo.name
		let uuid = mojangInfo.id
		ChatLib.editChat(468576858, new Message(`${prefix} &aGetting SBS data...`).setChatLineId(468576858))
		request("https://raw.githubusercontent.com/skyblockz/pricecheckbot/master/scammer.json").then(scammerData => {
			scammerData = JSON.parse(scammerData)
			if (Object.keys(scammerData).includes(uuid)) {
				ChatLib.chat("")
				ChatLib.chat(ChatLib.getCenteredText(`&cWARNING: ${player} IS A SCAMMER`))
				ChatLib.chat(ChatLib.getCenteredText(`&cReason: ${scammerData[uuid]["reason"]}\n`))
			}
			else {
				ChatLib.chat("")
				ChatLib.chat(ChatLib.getCenteredText(`&a${player} is NOT currently`))
				ChatLib.chat(ChatLib.getCenteredText(`&ain the scammer database`))
				ChatLib.chat(ChatLib.getCenteredText(`&cAlways be careful when trading with players!\n`))
			}
			ChatLib.clearChat(468576858)
		}).catch(error => {
			ChatLib.chat(error)
			ChatLib.clearChat(468576858)
		})
	}).catch(error => {
		ChatLib.chat(error)
		ChatLib.clearChat(468576858)
	})
}).setName("check")

addAllPlayersCompletion(scammerCommand)

export { scammerCommand }