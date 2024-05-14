import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand, EntityBlaze, drawLine3d, getEntityXYZ, getObjectXYZ, getRoomCenter, registerWhen } from "../../BloomCore/utils/Utils"
import RenderLib from "../../RenderLib"
import Config from "../Config"
import { convertToRealCoords, convertToRoomCoords, getCurrRoomInfo, onRoomEnter, onRoomExit } from "../utils/RoomUtils"

// H: 1.8, W: 0.6


let inBlaze = false
let blazes = []

register("worldUnload", () => {
    inBlaze = false
    blazes = []
})

register("command", () => {
    const la = Player.lookingAt()
    if (!(la instanceof Block)) return

    const [x, y, z] = getObjectXYZ(la)
    const roomInfo = getCurrRoomInfo()
    if (!roomInfo) return
    
    const [rx, ry, rot] = roomInfo
    const [x1, y1, z1] = convertToRoomCoords(x, y, z, rx, ry, rot)
    const block = World.getBlockAt(x, y, z)
    ChatLib.chat(`[${x1}, ${y1}, ${z1}]: ${block.type.getRegistryName()}`)

}).setName("roomlookingat")

onRoomEnter((roomX, roomZ, rotation) => {
    const roomCoords = [
        [-8, 69, -6],
        [-9, 72, 5],
    ]

    inBlaze = roomCoords.some(([x, y, z]) => {
        const [x1, y1, z1] = convertToRealCoords(x, y, z, roomX, roomZ, rotation)
        return World.getBlockAt(x1, y1, z1).type.getRegistryName() == "minecraft:leaves"
    })

})

onRoomExit(() => {
    inBlaze = false
    blazes = []
})

register("tick", () => {
    if (!Config.blazeSolver || !Dungeon.inDungeon || !inBlaze) return

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
    if (!blazes || !blazes.length) return

    blazes.sort((a, b) => hpMap.get(a) - hpMap.get(b))
    
    const [x, z] = getRoomCenter()
    // Looks for the platform which indicates the chest starts at the bottom
    if (World.getBlockAt(x+1, 118, z).type.getID() !== 4) {
        blazes.reverse()
    }
})

registerWhen(register("renderEntity", (entity, pos, pt, event) => {
    if (entity.getEntity() instanceof EntityBlaze) return cancel(event)
    if (entity.getName().removeFormatting().startsWith("[Lv15] Blaze ")) return cancel(event)
}), () => Config.blazeSolver && Dungeon.inDungeon && blazes.length)



registerWhen(register("renderWorld", () => {
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
}), () => Config.blazeSolver && Dungeon.inDungeon)