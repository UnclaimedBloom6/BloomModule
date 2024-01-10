import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand, getDistance3D } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"
import Config from "../Config"

let blazeStarted = null
let trueTimeStarted = null

register("tick", () => {
    if (!Dungeon.inDungeon || !Config.blazeTimer) return
    let blazeEntities = World.getAllEntitiesOfType(EntityArmorStand).filter(a => a.getName().removeFormatting().match(/^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/))
    let blazes = blazeEntities.length
    if (blazes) {
        let minDistance = blazeEntities.map(a => getDistance3D(Player.getX(), Player.getY(), Player.getZ(), a.getX(), a.getY(), a.getZ())).sort((a, b) => a-b)[0]
        // If too far away then don't count
        if (minDistance > 45) return
    }
    if (blazes == 10 && !trueTimeStarted) trueTimeStarted = Date.now()
    if (blazes == 9 && !blazeStarted) blazeStarted = Date.now()
    if (!blazes && blazeStarted) {
        new TextComponent(`${prefix} Blaze Puzzle took &b${Math.floor((Date.now() - blazeStarted)/10)/100}s`)
            .setHover("show_text", `&fTrue time taken: &b${Math.floor((Date.now() - trueTimeStarted)/10)/100}`).chat()
        blazeStarted = null
        trueTimeStarted = null
    }
})