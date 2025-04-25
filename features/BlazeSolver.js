import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand, EntityBlaze, drawLine3d, getEntityXYZ, getObjectXYZ, getRoomCenter, registerWhen } from "../../BloomCore/utils/Utils"
import RenderLib from "../../RenderLib"
import Config from "../Config"
import { convertToRealCoords, convertToRoomCoords, getCurrRoomInfo, onRoomEnter, onRoomExit } from "../utils/RoomUtils"
import { prefix } from "../utils/Utils"

// H: 1.8, W: 0.6


let inBlaze = false
let blazes = []

let blazeStarted = null
let trueTimeStarted = null
let lastBlazeCount = 10

// Spots to check for leaves in
const roomCoords = [
    [-8, 69, -6],
    [-9, 72, 5],
]

const solverRenderer = register("renderWorld", () => {
    blazes.forEach((entity, i) => {
        let [r, g, b] = i == 0 ? [0, 1, 0] : i == 1 ? [1, 0.5, 0] : [1, 1, 1]
        RenderLib.drawInnerEspBox(entity.getX(), entity.getY()-2, entity.getZ(), 0.6, 1.8, r, g, b, 1, false)

        // Drawing lines between the blazes
        if (Config.blazeSolverNextLine && i > 0 && i <= Config.blazeSolverLines) {
            let [x0, y0, z0] = getEntityXYZ(blazes[i-1])
            let [x1, y1, z1] = getEntityXYZ(blazes[i])
            drawLine3d(x0, y0, z0, x1, y1, z1, 1, 0, 0, 1, 3, false)
        }
    })
}).unregister()

const blazeHider = register("renderEntity", (entity, pos, pt, event) => {
    if (entity.getEntity() instanceof EntityBlaze) {
        cancel(event)
        return
    }

    if (entity.getName().removeFormatting().startsWith("[Lv15] Blaze ")) {
        cancel(event)
        return
    }
}).unregister()

const checkRenders = () => {
    if (blazes.length && Config.blazeSolver) {
        solverRenderer.register()
        blazeHider.register()
    }
    else {
        solverRenderer.unregister()
        blazeHider.unregister()
    }
}

onRoomEnter((roomX, roomZ, rotation) => {
    blazes = []
    blazeStarted = null
    trueTimeStarted = null
    lastBlazeCount = 10

    inBlaze = roomCoords.some(([x, y, z]) => {
        const [x1, y1, z1] = convertToRealCoords(x, y, z, roomX, roomZ, rotation)
        return World.getBlockAt(x1, y1, z1).type.getRegistryName() == "minecraft:leaves"
    })
})

register("tick", () => {
    if ((!Config.blazeSolver && !Config.blazeTimer) || !Dungeon.inDungeon || !inBlaze) {
        solverRenderer.unregister()
        blazeHider.unregister()
        return
    }

    const hpMap = new Map()
    blazes = []
    World.getAllEntitiesOfType(EntityArmorStand).forEach(e => {
        // https://regex101.com/r/g2x8Qo/1
        const match = e.getName().removeFormatting().match(/^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/)
        if (!match) return
        const [_, health] = match
        hp = parseInt(health.replace(/,/g, ""))
        hpMap.set(e, hp)
        blazes.push(e)
    })

    // Start each timer
    if (blazes.length == 10 && !trueTimeStarted) trueTimeStarted = Date.now()
    if (blazes.length == 9 && !blazeStarted) blazeStarted = Date.now()

    // Check for puzzle end
    if (!blazes || !blazes.length) {
        // Blaze count went from >1 to 0, must have failed
        if (lastBlazeCount !== 1 || !Config.blazeTimer) return

        new TextComponent(`${prefix} Blaze Puzzle took &b${Math.floor((Date.now() - blazeStarted)/10)/100}s`)
            .setHover("show_text", `&fTrue time taken: &b${Math.floor((Date.now() - trueTimeStarted)/10)/100}`).chat()

        lastBlazeCount = 0

        return
    }

    lastBlazeCount = blazes.length
    blazes.sort((a, b) => hpMap.get(a) - hpMap.get(b))
    
    const [x, z] = getRoomCenter()
    // Looks for the platform which indicates the chest starts at the bottom
    if (World.getBlockAt(x+1, 118, z).type.getID() !== 4) {
        blazes.reverse()
    }

    checkRenders()
})

