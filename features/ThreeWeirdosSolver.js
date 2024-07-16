import Config from "../Config";
import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand, getObjectXYZ, registerWhen } from "../../BloomCore/utils/Utils"
import { renderFilledBox } from "../../BloomCore/RenderUtils";
import { convertToRealCoords, onRoomEnter, onRoomExit } from "../utils/RoomUtils";

const solutions = [
    /The reward is not in my chest!/,
    /At least one of them is lying, and the reward is not in \w+'s chest.?/,
    /My chest doesn't have the reward\. We are all telling the truth.?/,
    /My chest has the reward and I'm telling the truth!/,
    /The reward isn't in any of our chests.?/,
    /Both of them are telling the truth\. Also, \w+ has the reward in their chest.?/,
]
const wrong = [
    /One of us is telling the truth!/,
    /They are both telling the truth\. The reward isn't in \w+'s chest./,
    /We are all telling the truth!/,
    /\w+ is telling the truth and the reward is in his chest./,
    /My chest doesn't have the reward. At least one of the others is telling the truth!/,
    /One of the others is lying./,
    /They are both telling the truth, the reward is in \w+'s chest./,
    /They are both lying, the reward is in my chest!/,
    /The reward is in my chest./,
    /The reward is not in my chest\. They are both lying./,
    /\w+ is telling the truth./,
    /My chest has the reward./
]

const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]

const correctChests = new Map() // "entityName": [x, y, z]
const incorrectChests = new Map()
let inWeirdos = false
const redstoneLocation = [-2, 69, 7] // minecraft:redstone_wire

onRoomEnter((roomX, roomY, rotation) => {
    const [x0, y0, z0] = redstoneLocation
    const [x1, y1, z1] = convertToRealCoords(x0, y0, z0, roomX, roomY, rotation)

    inWeirdos = World.getBlockAt(x1, y1, z1).type.getRegistryName() == "minecraft:redstone_wire"
})

onRoomExit(() => {
    inWeirdos = false
})

const doChestStuff = (entityName, mapToAddTo) => {
    if (mapToAddTo.has(entityName)) return
    
    const armorStand = World.getAllEntitiesOfType(EntityArmorStand).find(a => a.getName().removeFormatting() == entityName)
    if (!armorStand) return

    let [x, y, z] = getObjectXYZ(armorStand, true)
    
    for (let dir of directions) {
        let [dx, dz] = dir
        // 54 = Chest Block ID
        if (World.getBlockAt(x+dx, y, z+dz).type.getID() !== 54) continue
        mapToAddTo.set(entityName, [x+dx, y, z+dz])
        // ChatLib.chat(`${entityName}: ${JSON.stringify([x+dx, y, z+dz])}`)
        return
    }
}

register("chat", (event) => {
    if (!Dungeon.inDungeon || !Config.weirdosSolver || !inWeirdos) return

    const message = ChatLib.getChatMessage(event).removeFormatting()
    const match = message.match(/\[NPC\] (\w+): (.+)/)
    if (!match) return

    let [msg, name, text] = match
    // The correct answer
    if (solutions.some(a => text.match(a))) {
        cancel(event)
        ChatLib.chat(`&e[NPC] &c${name}&e: &a${text}`)
        doChestStuff(name, correctChests)
        return
    }
    
    if (!wrong.some(a => a.test(text))) return

    // The wrong answer
    cancel(event)
    ChatLib.chat(`&e[NPC] &c${name}: ${text}`)

    doChestStuff(name, incorrectChests)
})

const highlightChest = (coord, red, green, blue, alpha) => {
    const w = 0.875 + 0.002
    const h = 0.875 + 0.002
    let [x, y, z] = coord
    renderFilledBox(x+0.5, y, z+0.5, w, h, red, green, blue, alpha, false)
}

registerWhen(register("renderWorld", () => {
    correctChests.forEach((v, k) => highlightChest(v, 0, 1, 0, 0.5))
    incorrectChests.forEach((v, k) => highlightChest(v, 1, 0, 0, 0.5))
}), () => inWeirdos)

register("worldUnload", () => {
    correctChests.clear()
    incorrectChests.clear()
})