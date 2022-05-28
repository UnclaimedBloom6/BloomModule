import Config from "../Config"

register("chat", (e) => {
    if (!Config.bridgeChat) return
    let msg = ChatLib.getChatMessage(e).removeFormatting()
    let match = msg.match(/Guild >.+\[BOT\]: ([^:.]+): (.+)/)
    if (!match) return
    let [m, player, message] = match
    cancel(e)
    if (player == "Stats") return ChatLib.chat(`&2Guild > &dStats&f: ${message}`)
    ChatLib.chat(`&2Guild > &6${player} &e[Bridge]&f: ${message}`)
})
