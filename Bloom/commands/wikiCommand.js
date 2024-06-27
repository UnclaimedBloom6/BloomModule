import { openUrl, title } from "../../BloomCore/utils/Utils"
import { data, prefix } from "../utils/Utils"

const openWiki = (query) => {
    if (data.wikiType == "official") {
        openUrl(`https://wiki.hypixel.net/index.php?search=${query}`)
        return
    }
    else if (data.wikiType == "fandom") {
        openUrl(`https://hypixel-skyblock.fandom.com/wiki/Special:Search?query=${query}`)
        return
    }

    ChatLib.chat(`&cInvalid wiki type! `)
}

register("command", (...args) => {
    if (!args[0]) return ChatLib.chat(`&c/wiki <official|fandom|...query>`)

    const query = args.join("+").toLowerCase()

    if (query == "fandom" || query == "official") {
        data.wikiType = query
        data.save()
        ChatLib.chat(`${prefix} &a//wiki will now use the ${title(query)} wiki.`)
        return
    }

    openWiki(query)
}).setName("/wiki")