import { prefix } from "../utils/Utils"

let lastPingCommand
let waitingPingCommand
export const pingCommand = register("command", () => {
	lastPingCommand = new Date().getTime()
	waitingPingCommand = true
	new Message(`${prefix} &aCalculating Ping...`).setChatLineId(47564875).chat()
	ChatLib.command("fbkjgblsbnljhh")
}).setName("/ping")

register("chat", event => {
	if (waitingPingCommand) {
		let ping = new Date().getTime() - lastPingCommand
		ChatLib.clearChat(47564875)
		cancel(event)
		ChatLib.chat(`${prefix} &aCurrent Ping: ${(ping <= 100 ? "&a" : ping <= 200 ? "&e" : "&c") + ping}ms`)
		waitingPingCommand = false
	}
}).setCriteria(/&rUnknown command. Type \".+" for help.&r/)
