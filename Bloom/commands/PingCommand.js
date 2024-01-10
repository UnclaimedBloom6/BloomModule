import { onChatPacket } from "../../BloomCore/utils/Events"
import { prefix } from "../utils/Utils"

let lastPingCommand
let waitingPingCommand

export const pingCommand = register("command", () => {
	lastPingCommand = Date.now()
	waitingPingCommand = true

	ChatLib.command("fbkjgblsbnljhh", false)
}).setName("/ping")

onChatPacket((event) => {
    if (!waitingPingCommand) return
    
    let ping = Date.now() - lastPingCommand
    cancel(event)
    ChatLib.chat(`${prefix} &aCurrent Ping: ${(ping <= 100 ? "&a" : ping <= 200 ? "&e" : "&c") + ping}ms`)
    waitingPingCommand = false

}).setCriteria(/^Unknown command\. Type \"\/help\" for help\. \(\'.+\'\)$/)
