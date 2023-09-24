import { prefix } from "../utils/Utils"

let lastPingCommand
let waitingPingCommand

export const pingCommand = register("command", () => {
	lastPingCommand = new Date().getTime()
	waitingPingCommand = true

	ChatLib.command("fbkjgblsbnljhh", false)
}).setName("/ping")

register("chat", event => {
	if (!waitingPingCommand) return

    let ping = new Date().getTime() - lastPingCommand
    cancel(event)
    ChatLib.chat(`${prefix} &aCurrent Ping: ${(ping <= 100 ? "&a" : ping <= 200 ? "&e" : "&c") + ping}ms`)
    waitingPingCommand = false
}).setCriteria(/^Unknown command\. Type \"\/help\" for help\. \(\'.+\'\)$/)
