import Config from "../Config"
import { data, prefix } from "../utils/Utils"
import request from "../../requestV2"

let bloomCommand = register("command", (...args) => {
    if (!args || !args[0]) {
        if (!args || !args[0])  return Config.openGUI()
    }
    if (args[0] == "setkey") {
        if (!args[1]) return ChatLib.chat(`${prefix} &c/bl setkey <key>`)
        new Message(`${prefix} &aChecking API key...`).setChatLineId(857684765).chat()
        request(`https://api.hypixel.net/key?key=${args[1]}`).then(stuff => {
            data.apiKey = args[1]
            data.save()
            ChatLib.editChat(857684765, new Message(`${prefix} &aAPI Key set successfully!`))
        }).catch(error => { ChatLib.editChat(857684765, new Message(`${prefix} &cError: Invalid API key.`)) })
    }
    if (args[0] == "help") {
        let messages = [
            `&a&m${ChatLib.getChatBreak(" ")}`,
			`&b&n Bloom `,
			` `,
			`&7/ds <player> &8- Dungeon Stats`,
			`&7/mem <player> &8- Guild Stats`,
			`&7/check <player> &8- Check For Scammer`,
			`&7//rp [...exclude] &8- Reparty. Add players to skip.`,
            `&7/bl &8- Open config GUI`,
			`&7/bl setkey <key> &8- Set API Key`,
            `&7/ping &8- Check your ping`,
            `&7/skills <player> &8- Get a player's skills`,
			`&aAn API key is required for a lot of commands.`,
			`&a&m${ChatLib.getChatBreak(" ")}`
        ]
        messages.forEach(a => ChatLib.chat(ChatLib.getCenteredText(a)))
        let link = "https://github.com/UnclaimedBloom6/BloomModule"
        new Message(new TextComponent(`${prefix} &a&aFor a more in-depth list of features, click on this message to go to the BloomModule Github.`).setHover("show_text", link).setClick("open_url", link)).chat()
    }
}).setName("bl")
export { bloomCommand }