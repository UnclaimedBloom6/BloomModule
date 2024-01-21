import Config from "../Config"

export const bloomCommand = register("command", (...args) => {
    if (!args || !args[0]) return Config.openGUI()

    if (args[0] == "setkey") return ChatLib.command(`bcore setkey ${args[1]}`, true)

    if (args[0] == "help") {
        let messages = [
            `&a&m${ChatLib.getChatBreak(" ")}`,
			`&b&n Bloom `,
			` `,
            `&7/bl &8- Open config GUI`,
			`&7/bl setkey <key> &8- Set API Key`,
			`&7/ds <player> &8- Dungeon Stats`,
			`&7/mem <player> &8- Guild Stats`,
			`&7//rp [...exclude] &8- Reparty. Add players to skip.`,
            `&7//ping &8- Check your ping`,
            `&7//skills <player> &8- Get a player's skills`,
			`&aAn API key is required for a lot of commands.`,
			`&a&m${ChatLib.getChatBreak(" ")}`
        ]
        ChatLib.chat(messages.join("\n"))
        // messages.forEach(a => ChatLib.chat(ChatLib.getCenteredText(a)))
    }
}).setName("bloom").setAliases(["bl"])