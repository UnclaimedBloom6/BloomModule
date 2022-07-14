import Dungeon from "../../BloomCore/Dungeons/Dungeon"
import { EntityArmorStand, getDistance3D } from "../../BloomCore/Utils/Utils"
import { prefix } from "../utils/Utils"
import Config from "../Config"

let blazeStarted = null
let trueTimeStarted = null

register("tick", () => {
    if (!Dungeon.inDungeon || !Config.blazeTimer) return
    let blazeEntities = World.getAllEntitiesOfType(EntityArmorStand).filter(a => a.getName().removeFormatting().match(/\[Lv\d+\] Blaze \d+\/\d+./))
    let blazes = blazeEntities.length
    if (blazes) {
        let minDistance = blazeEntities.map(a => getDistance3D(Player.getX(), Player.getY(), Player.getZ(), a.getX(), a.getY(), a.getZ())).sort((a, b) => a-b)[0]
        // If too far away then don't count
        if (minDistance > 45) return
    }
    if (blazes == 10 && !trueTimeStarted) trueTimeStarted = new Date().getTime()
    if (blazes == 9 && !blazeStarted) blazeStarted = new Date().getTime()
    if (!blazes && blazeStarted) {
        new TextComponent(`${prefix} Blaze Puzzle took &b${Math.floor((new Date().getTime() - blazeStarted)/10)/100}s`)
            .setHover("show_text", `&fTrue time taken: &b${Math.floor((new Date().getTime() - trueTimeStarted)/10)/100}`).chat()
        blazeStarted = null
        trueTimeStarted = null
    }
})