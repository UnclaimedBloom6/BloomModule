import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { renderBoxOutline, renderFilledBox } from "../../BloomCore/RenderUtils"
import { EntityArmorStand, EntityOtherPlayerMP } from "../../BloomCore/utils/Utils"
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
    if (!Dungeon.inDungeon || !Config.lividSolver || Dungeon.floorNumber !== 5) {
        solverRenderer.unregister()
        lividHider.unregister()
        livid = null
        return
    }
    
    const wool = World.getBlockAt(5, 108, 43) // wool on ceiling
    if (!wool || wool.type.getID() !== 35) {
        solverRenderer.unregister()
        lividHider.unregister()
        livid = null
        return
    }

    const woolMeta = wool.getMetadata()
    const lividData = livids.find(a => a[0] == woolMeta)

    if (!lividData) {
        return
    }

    const lividEntity = World.getAllEntitiesOfType(EntityOtherPlayerMP).find(a => a.getName() == `${lividData[1]} Livid`)
    const nametagArmorStand = World.getAllEntitiesOfType(EntityArmorStand).find(a => a.getName().startsWith(lividData[2]))

    if (!lividEntity || !nametagArmorStand) {
        solverRenderer.unregister()
        lividHider.unregister()
        livid = null
        return
    }
    
    livid = new Livid(...lividData, lividEntity, nametagArmorStand)
    solverRenderer.register()

    if (Config.hideWrongLivids) {
        lividHider.register()
    }
})

const solverRenderer = register("renderWorld", () => {
    const x = livid.entity.getRenderX()
    const y = livid.entity.getRenderY()
    const z = livid.entity.getRenderZ()

    renderFilledBox(x, y, z, 0.6, 1.8, 0, 1, 0, 0.2, false)
    renderBoxOutline(x, y, z, 0.6, 1.8, 0, 1, 0, 1, 1, false)
}).unregister()

const lividHider = register("renderEntity", (entity, _, __, event) => {
    const entityName = entity.getName()
    if (entityName == livid.entity.getName() || entityName == livid.armorStand.getName()) {
        return
    }

    const isStand = /^§.﴾ §.§lLivid§r§r §.[\dMmKk\.]+§.❤ §.﴿$/.test(entityName)
    const isLivid = /^\w+ Livid$/.test(entityName)

    // Not a livid
    if (!isStand && !isLivid) {
        return
    }
    
    cancel(event)
}).unregister()

register("worldUnload", () => {
    livid = null
    solverRenderer.unregister()
    lividHider.unregister()
})
