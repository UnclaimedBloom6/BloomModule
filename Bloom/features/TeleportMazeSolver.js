import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { getCurrentRoom, getPlayerCoords, getPlayerLookVec, getRoomComponent } from "../../BloomCore/utils/Utils"
import Vector3 from "../../BloomCore/utils/Vector3"
import RenderLib from "../../RenderLib"
import { prefix } from "../utils/Utils"
import Config from "../Config"

let inTpMaze = false
let teleportPads = {}
register("tick", () => {
    if (!Config.tpMazeSolver || !Dungeon.inDungeon) return
    let room = getCurrentRoom()
    if (!room || room.name !== "Teleport Maze") return inTpMaze = false
    inTpMaze = true
    if (Object.keys(teleportPads).length) return
    let coords = getRoomComponent()
    if (!coords) return
    let [cornerX, cornerZ] = [
        -200 + coords[0] * 32,
        -200 + coords[1] * 32
    ]
    // ChatLib.chat(`Scanning for teleport pads...`)
    for (let x = cornerX; x < cornerX + 32; x++) {
        for (let z = cornerZ; z < cornerZ + 32; z++) {
            let block = World.getBlockAt(x, 69, z)
            if (block?.type?.getID() !== 120) continue
            teleportPads[`${block.getX()},${block.getZ()}`] = 0
        }
    }
    // ChatLib.chat(JSON.stringify(teleportPads, null, 4))
    // ChatLib.chat(`Done! Found ${teleportPads.length} teleport pads!`)
})

register("worldUnload", () => {
    teleportPads = {}
    inTpMaze = false
})

const updatePads = () => {
    let [px, py, pz] = getPlayerCoords()
    let found = false
    for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
            if (found) continue
            let block = World.getBlockAt(px+x, 69, pz+z)
            if (block.type.getID() !== 120) continue
            px = block.getX()
            pz = block.getZ()
            found = true
        }
    }
    let lookVec = getPlayerLookVec()
    lookVec.y = 0
    Object.keys(teleportPads).forEach(pad => {
        let [x, z] = pad.split(",")
        let newVec = new Vector3(x - px, 0, z - pz)
        let angle = lookVec.getAngleDeg(newVec)
        if (isNaN(angle)) angle = 0
        teleportPads[pad] += angle
    })
    let sorted = Object.keys(teleportPads).sort((a, b) => teleportPads[a] - teleportPads[b])
    teleportPads = sorted.reduce((a, b) => (a[b] = teleportPads[b], a), {})
}

register("soundPlay", (pos, name, vol, pitch, category, event) => {
    if (!Config.tpMazeSolver || !Dungeon.inDungeon) return
    if (!inTpMaze || name !== "mob.endermen.portal") return
    updatePads()
})

register("renderWorld", () => {
    if (!Config.tpMazeSolver || !Dungeon.inDungeon || !inTpMaze || !Object.keys(teleportPads).length) return
    if (Object.values(teleportPads).every(a => !a)) return
    let firstPad = 0
    Object.keys(teleportPads).forEach((pad, i) => {
        if (i == 0) firstPad = teleportPads[pad]
        let [x, z] = pad.split(",").map(a => parseInt(a))
        if (teleportPads[pad] > firstPad*2) return
        let color = [1, 1, 0]
        if (i == 0) color = [0, 1, 0]
        RenderLib.drawInnerEspBox(x+0.5, 69, z+0.5, 1.01, 0.82, ...color, 0.8, false)
    })
})
