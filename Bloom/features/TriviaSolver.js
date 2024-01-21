import request from "../../requestV2"
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand } from "../../BloomCore/utils/Utils"
import Config from "../Config"

let triviaData = null
request({
    url: "https://data.skytils.gg/solvers/oruotrivia.json", // Thanks Noobtils! (This is actually very helpful xd)
    headers: {
        "User-Agent": "Mozilla/5.0",
    },
    json: true
}).then(d => triviaData = d).catch(e => console.error(`[Bloom] Failed to get Trivia solutions: $${e}`))

let solutions = []
register("chat", event => {
    if (!Dungeon.inDungeon || !Config.triviaSolver || !triviaData) return
    let message = ChatLib.getChatMessage(event)
    let unformatted = message.removeFormatting().trim()
    
    // Quiz just opened, reset the solutions from the last time
    if (unformatted.match(/^\[STATUE\] Oruo the Omniscient: .+$/)) return solutions = []

    if (unformatted in triviaData) return solutions = triviaData[unformatted]

    if (unformatted == "What SkyBlock year is it?") {
        // Calculation from Danker's Skyblock Mod
        const year = Math.floor((Date.now() / 1000 - 1560276000) / 446400 + 1)
        solutions = [`Year ${year}`]
        return
    }

    // Make the correct answer green and the wrong ones red
    const match = unformatted.match(/^[ⓐⓑⓒ] (.+)$/)
    if (!match) return
    let [m, ans] = match
    cancel(event)
    if (solutions.some(a => ans == a)) return ChatLib.chat(message.replace(/§a/, "§a§l"))
    ChatLib.chat(message.replace(/§a/, "§4"))
})

// Make the question show green in the room too
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