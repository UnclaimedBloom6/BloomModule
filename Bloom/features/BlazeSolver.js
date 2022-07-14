import Dungeon from "../../BloomCore/Dungeons/Dungeon"
import { EntityArmorStand, getDistance2D } from "../../BloomCore/Utils/Utils"
import RenderLib from "../../RenderLib"
import Config from "../Config"

const EntityBlaze = Java.type("net.minecraft.entity.monster.EntityBlaze")

// H: 1.8, W: 0.6

let blazes = []
let blazeType = null // null=unknown

const gethp = (blazeStand) => {
    const match = blazeStand.getName().removeFormatting().match(/\[Lv15\] Blaze \d+\/(\d+)/)
    if (!match) return null
    return parseInt(match[1])
}

// Converts real world coordinates to where they would appear on the map. Since the max size dungeon
// is 6x6, it will return an array of two numbers from 0 to 5 [0-5, 0-5] corresponding to their location
// on the hotbar map
const getRoomMapCoords = ([x, z]) => [MathLib.map(x, -200, -10, 0, 5), MathLib.map(z, -200, -10, 0, 5)]

// Converts the coordinates of a room into its real world coordinates. Eg 0, 0 for the top left room would return
// [-184, -184] as that is the corner of the top left most room in the dungeon.
const getRoomCenter = ([x, z]) => [MathLib.map(x, 0, 5, -185, -25), MathLib.map(z, 0, 5, -185, -25)]

register("tick", () => {
    if (!Config.blazeSolver || !Dungeon.inDungeon) return
    blazes = World.getAllEntitiesOfType(EntityArmorStand).filter(a => a.getName().removeFormatting().startsWith("[Lv15] Blaze ")).sort((a, b) => gethp(a) - gethp(b))
    if (!blazes || !blazes.length) return
    if (!blazeType) {
        for (let x = 0; x < 6; x++) {
            for (let z = 0; z < 6; z++) {
                let [xx, zz] = getRoomCenter([x, z])
                if (getDistance2D(xx, zz, blazes[0].getX(), blazes[0].getZ()) > 15) {
                    continue
                }
                if (World.getBlockAt(xx+1, 118, zz).type.getRegistryName() == "minecraft:cobblestone") blazeType = "b"
                else blazeType = "t"
            }
        }
    }
    if (blazeType == "t") blazes.reverse()
    // blazes.map(a => ChatLib.chat(a.getName()))
})

register("worldUnload", () => {
    blazes = []
    blazeType = null
})

register("renderEntity", (entity, pos, pt, event) => {
    if (!Config.blazeSolver || !Dungeon.inDungeon || !blazes.length || !blazeType) return
    if (entity.getClassName() == "EntityBlaze") return cancel(event)
    if (entity.getName().removeFormatting().startsWith("[Lv15] Blaze ")) return cancel(event)
})

register("renderWorld", () => {
    if (!Config.blazeSolver || !Dungeon.inDungeon || !blazeType) return
    blazes.forEach((entity, i) => {
        let [r, g, b] = i == 0 ? [0, 1, 0] : i == 1 ? [1, 0.5, 0] : [1, 1, 1]
        RenderLib.drawInnerEspBox(entity.getX(), entity.getY()-2, entity.getZ(), 0.6, 1.8, r, g, b, 1, false)
    })
})