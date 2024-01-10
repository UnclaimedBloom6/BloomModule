import request from "../../requestV2"
import Config from "../Config"
import { data } from "../utils/Utils"

// 30 mins since last update
if (Date.now() - data.bridge.lastUpdated > 1.8E6) {
    data.bridge.lastUpdated = Date.now()
    request("https://raw.githubusercontent.com/UnclaimedBloom6/BloomModule/main/api.json").then(d => {
        let regex = JSON.parse(d).bridgeRegex
        if (!regex) return
        data.bridge.regex = regex
        data.save()
    })
}

register("chat", (e) => {
    const re = data.bridge.regex
    if (!Config.bridgeChat || !re) return
    let msg = ChatLib.getChatMessage(e).removeFormatting()
    
    let match = msg.match(new RegExp(re))
    if (!match) return
    let [m, player, message] = match
    cancel(e)
    if (player == "Stats") return ChatLib.chat(`&2Guild > &dStats&f: ${message}`)
    ChatLib.chat(`&2Guild > &6${player} &e[Bridge]&f: ${message}`)
})
