import request from "../../requestV2"
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"
import { convertToRealCoords, onRoomEnter } from "../utils/RoomUtils"
import { renderBoxOutline, renderFilledBox } from "../../BloomCore/RenderUtils"

let triviaData = JSON.parse(FileLib.read("Bloom", "data/quizAnswers.json"))
// Update quiz answers
if (!data.lastQuizFetch || Date.now() - data.lastQuizFetch > 1_200_000) {
    data.lastQuizFetch = Date.now()
    request({
        url: "https://raw.githubusercontent.com/UnclaimedBloom6/BloomModule/refs/heads/main/data/quizAnswers.json",
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
        json: true
    }).then(data => {
        FileLib.write("Bloom", "data/quizAnswers.json", JSON.stringify(data, null, 4), true)

        triviaData = data
    }).catch(e => {
        console.error(`[Bloom] Failed to get Trivia solutions: $${e}`)
    })
}

const buttons = {
    "ⓐ": [5, 70, -9],
    "ⓑ": [0, 70, -6],
    "ⓒ": [-5, 70, -9]
}

let roomInfo = null
let correctLetter = null
const buttonHighlighter = register("renderWorld", () => {
    if (!correctLetter || !roomInfo) return

    const { roomX, roomZ, rotation } = roomInfo

    for (let entry of Object.entries(buttons)) {
        let [letter, pos] = entry
        let [x, y, z] = convertToRealCoords(pos[0], pos[1], pos[2], roomX, roomZ, rotation)

        let r = 1
        let g = 0
        let b = 0

        if (letter == correctLetter) {
            r = 0
            g = 1
        }

        renderFilledBox(x+0.5, y, z+0.5, 1.005, 1.005, r, g, b, 0.3, false)
        renderBoxOutline(x+0.5, y, z+0.5, 1.005, 1.005, r, g, b, 1, 2, false)
    }
}).unregister()

let solutions = []

register("chat", () => {
    solutions = []
    buttonHighlighter.unregister()
    correctLetter = null
}).setCriteria(/^\[STATUE\] Oruo the Omniscient: .+$/)

register("chat", () => {
    if (!Config.triviaSolver) return

    // Calculation from Danker's Skyblock Mod
    const year = Math.floor((Date.now() / 1000 - 1560276000) / 446400 + 1)
    solutions = [`Year ${year}`]
    buttonHighlighter.register()
    return
}).setCriteria(/^ *What SkyBlock year is it\?$/)

register("chat", event => {
    if (!Dungeon.inDungeon || !Config.triviaSolver || !triviaData) return
    let message = ChatLib.getChatMessage(event)
    let unformatted = message.removeFormatting().trim()

    // Question found in chat
    if (unformatted in triviaData) {
        solutions = triviaData[unformatted]
        return
    }

    // Make the correct answer green and the wrong ones red
    const match = unformatted.match(/^([ⓐⓑⓒ]) (.+)$/)
    if (!match) return
    let [m, letter, ans] = match
    cancel(event)

    // Make correct answer green
    if (solutions.some(a => ans == a)) {
        ChatLib.chat(message.replace(/§a/, "§a§l"))
        correctLetter = letter
        return
    }

    ChatLib.chat(message.replace(/§a/, "§4"))

    buttonHighlighter.register()
})

onRoomEnter((roomX, roomZ, rotation) => {
    if (!Config.triviaSolver) return

    const [x, y, z] = convertToRealCoords(0, 85, 2, roomX, roomZ, rotation)
    const glowstoneBlock = World.getBlockAt(x, y, z).type.getRegistryName()

    // If this block is glowstone, this room is Quiz
    if (glowstoneBlock !== "minecraft:glowstone") return

    // ChatLib.chat(`Entered Quiz`)
    roomInfo = {
        roomX,
        roomZ,
        rotation
    }
})

Config.registerListener("Trivia Solver", state => {
    if (state) {
        buttonHighlighter.register()
    }
    else {
        buttonHighlighter.unregister()
        highlightPos = null
        solutions = []
    }
})

register("worldUnload", () => {
    solutions = []
    buttonHighlighter.unregister()
    highlightPos = null
})