import { renderBlockHitbox, renderBoxFromCorners, renderBoxOutline, renderFilledBox } from "../../BloomCore/RenderUtils";
import { onScoreboardLine } from "../../BloomCore/utils/Events";
import { S08PacketPlayerPosLook, drawLine3d, getPlayerEyeCoords, manhattanDistance, registerWhen } from "../../BloomCore/utils/Utils";
import Vector3 from "../../BloomCore/utils/Vector3";

const getPseudoRandomRGB = (index) => {
    const indexString = String(index*10)
    let hash = 123456789
    
    for (let i = 0; i < indexString.length; i++) {
        let charCode = indexString.charCodeAt(i)
        hash = ((hash << 5) - hash) + charCode
        hash |= 0
    }
    const red = (hash & 0xFF0000) >> 16
    const green = (hash & 0x00FF00) >> 8
    const blue = hash & 0x0000FF
  
    return [red/255, green/255, blue/255]
}

class TpPad {
    constructor(x, z, block) {
        this.twin = null

        this.x = x
        this.z = z

        this.cellX = 0
        this.cellZ = 0

        this.totalAngle = 0 // The pad with the lowest angle is probably the end pad
        this.blacklisted = false // Already been to this pad
        this.block = block // The CT block to render the block hitbox with
    }

    toString() {
        return `TpPad[x=${this.x}, z=${this.z}, cellX=${this.cellX}, cellY=${this.cellZ}, twin=${!!this.twin}]`
    }
}

class Cell {
    constructor(xIndex, zIndex) {
        this.pads = new Set()

        this.xIndex = xIndex
        this.zIndex = zIndex
    }

    addPad(pad) {
        this.pads.add(pad)
    }

    toString() {
        return `Cell[x=${this.xIndex}, z=${this.zIndex} pads=${this.pads.size}]`
    }
}

let minX = null
let minZ = null
let cells = null
let orderedPads = null // Pads in order from most to least likely to be the end
let dungeonPos = null // [x, z] from 0-6 on the map

const reset = () => {
    minX = null
    minZ = null
    cells = null
    orderedPads = null
    dungeonPos = null
}

const getCellAt = (x, z) => {
    if (x < minX || x > minX + 23 || z < minZ || z > minZ + 23) return null

    const cx = Math.floor((x - minX) / 8)
    const cz = Math.floor((z - minZ) / 8)

    return cells.find(a => a.xIndex == cx && a.zIndex == cz) ?? null
}

const getPadNear = (x, z) => {
    const cell = getCellAt(x, z)
    if (!cell) return null

    for (let pad of cell.pads) {
        let dist = manhattanDistance(x, z, pad.x, pad.z)
        if (dist <= 3) return pad
    }

    return null
}

const isPadInStartOrEndCell = (tpPad) => {
    if (cells[4].pads.has(tpPad)) return true

    // Look for the stating cell
    for (let cell of cells) {
        if (cell.pads.size !== 1 || cell == cells[4] || !cell.pads.has(tpPad)) continue
        return true
    }

    return false
}

const getDungeonPositionIndex = () => {
    const xIndex = Math.floor((Player.getX() + 200) / 32)
    const zIndex = Math.floor((Player.getZ() + 200) / 32)
    return [xIndex, zIndex]
}

const roomExitListener = register("tick", () => {
    const [x, z] = getDungeonPositionIndex()
    // Reset stuff when the player walks outside of tp maze
    if (!dungeonPos || dungeonPos[0] !== x || dungeonPos[1] !== z) {
        roomExitListener.unregister()
        reset()
    }
})

register("worldUnload", reset)

onScoreboardLine((_, text) => {
    if (!text.match(/^§7\d+\/\d+\/\d+ §8[^ ]+ -60,-456$/)) return
    reset()
    roomExitListener.register()
    
    const [xIndex, zIndex] = getDungeonPositionIndex()
    dungeonPos = [xIndex, zIndex]

    const roomX = xIndex * 32 - 200
    const roomZ = zIndex * 32 - 200
    
    let pads = []
    for (let dx = 0; dx <= 31; dx++) {
        for (let dz = 0; dz <= 31; dz++) {
            let block = World.getBlockAt(roomX + dx, 69, roomZ + dz)
            if (block.type.getID() !== 120) continue

            pads.push(new TpPad(roomX+dx, roomZ+dz, block))
        }
    }

    const xCoords = pads.map(a => a.x)
    const zCoords = pads.map(a => a.z)

    minX = Math.min(...xCoords)
    minZ = Math.min(...zCoords)

    cells = new Array(9).fill().map((_, i) => new Cell(Math.floor(i/3), i%3))

    for (let pad of pads) {
        pad.cellX = Math.floor((pad.x - minX) / 8)
        pad.cellZ = Math.floor((pad.z - minZ) / 8)

        let hash = pad.cellX*3 + pad.cellZ
        cells[hash].addPad(pad)
    }
})

registerWhen(register("renderWorld", () => {
    if (!cells) return

    // To draw the pairs
    // const drawn = new Set()
    // cells.forEach(cell => {
    //     let i = 0
    //     for (let pad of cell.pads) {
    //         i++
    //         if (drawn.has(pad) || !pad.twin) continue
    //         drawn.add(pad)

    //         let [r, g, b] = getPseudoRandomRGB(i)
    //         renderBlockHitbox(pad.block, r, g, b, 1, true, 2, false)
    //         renderBlockHitbox(pad.block, r, g, b, 0.3, true, 2, true)
    //         // renderFilledBox(pad.x+0.5, 69, pad.z+0.5, 1, 1, r, g, b, 1, true)
    //         // renderFilledBox(pad.twin.x+0.5, 69, pad.twin.z+0.5, 1, 1, r, g, b, 1, true)
    //         drawLine3d(pad.x+0.5, 69.5, pad.z+0.5, pad.twin.x+0.5, 69.5, pad.twin.z+0.5, r, g, b, 1, 2, true)
    //     }
    // })

    if (!orderedPads || orderedPads.length < 2) return
    if (!orderedPads[0] || orderedPads[0].totalAngle == orderedPads[1].totalAngle) return

    // Why the fuck does this error saying that orderedpads[0] is undefined? I have a fucking check for it
    renderBlockHitbox(orderedPads[0].block, 0, 1, 0, 1, true, 2, false)
    renderBlockHitbox(orderedPads[0].block, 0, 1, 0, 0.3, true, 2, true)
    
    for (let cell of cells) {
        for (let pad of cell.pads) {
            if (!pad.blacklisted) continue
            renderBoxOutline(pad.x+0.5, 69, pad.z+0.5, 1.002, 0.82, 1, 0, 0, 1, 2, false)
            renderFilledBox(pad.x+0.5, 69, pad.z+0.5, 1.002, 0.82, 1, 0, 0, 0.5, false)
        }
    }
}), () => !!cells)

const calcPadAngles = (x, z, yaw) => {
    const eyeVec = Vector3.fromPitchYaw(0, yaw)

    orderedPads = []
    for (let cell of cells) {
        for (let pad of cell.pads) {
            if (isPadInStartOrEndCell(pad) || pad.blacklisted) continue

            let padVec = new Vector3(pad.x+0.5 - x, 0, pad.z+0.5 - z)
            let angle = eyeVec.getAngleDeg(padVec)
            pad.totalAngle += angle
            orderedPads.push(pad)
        }
    }

    orderedPads.sort((a, b) => a.totalAngle - b.totalAngle)
}

register("packetReceived", (packet) => {
    if (!cells) return

    const yaw = packet.func_148931_f()
    const x = packet.func_148932_c()
    const y = packet.func_148928_d()
    const z = packet.func_148933_e()

    if (x%0.5 !== 0 || y !== 69.5 || z%0.5 !== 0) return

    // ChatLib.chat(`S08: [&6${x}&f, &6${y}&f, &6${z}&f], yaw=&d${yaw}`)

    const newPad = getPadNear(x, z)
    const oldPad = getPadNear(Player.getX(), Player.getZ())
    if (!newPad || !oldPad) return

    if (isPadInStartOrEndCell(newPad)) {
        // Reset the pads once you teleport to the end or back to the start
        for (let cell of cells) {
            for (let pad of cell.pads) {
                pad.blacklisted = false
                pad.totalAngle = 0
            }
        }
        return
    }
    newPad.blacklisted = true
    oldPad.blacklisted = true
    newPad.twin = oldPad
    oldPad.twin = newPad

    calcPadAngles(x, z, yaw)
}).setFilteredClass(S08PacketPlayerPosLook)