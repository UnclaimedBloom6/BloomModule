import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand, EntityOtherPlayerMP, registerWhen } from "../../BloomCore/utils/Utils"
import RenderLib from "../../RenderLib"
import Config from "../Config"

class Livid {
    constructor(woolMeta, name, color, entity, armorStand) {
        this.wool = woolMeta
        this.name = name
        this.color = color
        this.entity = entity
        this.armorStand = armorStand
    }
}

// [woolMeta, lividName, color]
const livids = [
    [0, "Vendetta", "§f"],
    [2, "Crossed", "§d"],
    [4, "Arcade", "§e"],
    [5, "Smile", "§a"],
    [7, "Doctor", "§7"],
    [10, "Purple", "§5"],
    [11, "Scream", "§9"],
    [13, "Frog", "§2"],
    [14,  "Hockey", "§c"]
]
let livid = null
register("tick", () => {
    if (!Dungeon.inDungeon || !Config.lividSolver || Dungeon.floorNumber !== 5) return livid = null
    let wool = World.getBlockAt(5, 108, 43) // wool on ceiling
    if (!wool || wool.type.getID() !== 35) return livid = null

    let meta = wool.getMetadata()
    let lividData = livids.find(a => a[0] == meta)
    if (!lividData) return

    const lividEntity = World.getAllEntitiesOfType(EntityOtherPlayerMP).find(a => a.getName() == `${lividData[1]} Livid`)
    const nametagArmorStand = World.getAllEntitiesOfType(EntityArmorStand).find(a => a.getName().startsWith(lividData[2]))
    if (!lividEntity || !nametagArmorStand) return livid = null
    
    livid = new Livid(...lividData, lividEntity, nametagArmorStand)
})

registerWhen(register("renderWorld", () => {
    if (!livid) return
    RenderLib.drawEspBox(livid.entity.getRenderX(), livid.entity.getRenderY(), livid.entity.getRenderZ(), 0.6, 1.8, 0, 1, 0, 1, false)
}), () => Dungeon.inDungeon && livid && Config.lividSolver)

registerWhen(register("renderEntity", (entity, pos, pt, event) => {
    if (!livid || !entity.getName().includes("Livid")) return
    if ([livid.entity.getName(), livid.armorStand.getName()].some(a => entity.getName() == a)) return
    // if (!entity.getName().endsWith(" Livid") || entity.getName() == livid.getName()) return
    cancel(event)
}), () => Dungeon.inDungeon && Config.hideWrongLivids && livid)

register("worldLoad", () => livid = null)

