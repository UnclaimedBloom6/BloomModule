import request from "../../requestV2"
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand } from "../../BloomCore/utils/Utils"
import Config from "../Config"

let triviaData = null
request({
    url: "https://data.skytils.gg/solvers/oruotrivia.json", // Thanks Noobtils! (This is actually very helpful xd)
    headers: {
        "User-Agent": "Mozilla/5.0",
    }
}).then(d => triviaData = JSON.parse(d)).catch(e => console.error("[Bloom] Failed to get Trivia solutions."))

let solutions = []
register("chat", event => {
    if (!Dungeon.inDungeon || !Config.triviaSolver || !triviaData) return
    let message = ChatLib.getChatMessage(event)
    let unformatted = message.removeFormatting().trim()
    if (unformatted.match(/\[STATUE\] Oruo the Omniscient: .+/)) return solutions = []
    if (Object.keys(triviaData).includes(unformatted)) return solutions = triviaData[unformatted]
    if (unformatted == "What SkyBlock year is it?") return solutions = [`Year ${Math.floor((new Date().getTime()/1000 - 1560276000) / 446400 + 1)}`] // Calculation from Danker's Skyblock Mod
    let match = unformatted.match(/[ⓐⓑⓒ] (.+)/)
    if (!match) return
    let [m, ans] = match
    cancel(event)
    if (solutions.some(a => ans == a)) return ChatLib.chat(message.replace(/§a/, "§a§l"))
    ChatLib.chat(message.replace(/§a/, "§4"))
})


register("tick", () => {
    if (!solutions || !Config.triviaSolver || !Dungeon.inDungeon) return
    let stands = World.getAllEntitiesOfType(EntityArmorStand)
    stands.forEach(a => {
        let match = a.getName().removeFormatting().match(/([ⓐⓑⓒ]) ([^.]+)[.+]?/)
        if (!match) return
        let [m, q, ans] = match
        if (solutions.some(a => a == ans)) return a.getEntity().func_96094_a(`§6${q} §a§l${ans}`)
        a.getEntity().func_96094_a(`§6${q} §4${ans}`)
    })
})

register("worldUnload", () => {
    solutions = []
})