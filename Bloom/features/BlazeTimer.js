import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { EntityArmorStand, getCurrentRoom } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"
import Config from "../Config"

let blazeStarted = null
let trueTimeStarted = null
let lastBlazeCount = 10

register("tick", () => {
    if (!Dungeon.inDungeon || !Config.blazeTimer) return

const currentRoom = getCurrentRoom()
    if (!currentRoom || currentRoom.name !== "Blaze") return
    
    const blazeEntities = World.getAllEntitiesOfType(EntityArmorStand).filter(a => a.getName().removeFormatting().match(/^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/))
    const blazeCount = blazeEntities.length

    if (blazeCount == 10 && !trueTimeStarted) trueTimeStarted = Date.now()
    if (blazeCount == 9 && !blazeStarted) blazeStarted = Date.now()

    
    if (blazeCount == 0 && lastBlazeCount > 1) return
    lastBlazeCount = blazeCount

    if (!blazeStarted || blazeCount > 0) return

    new TextComponent(`${prefix} Blaze Puzzle took &b${Math.floor((Date.now() - blazeStarted)/10)/100}s`)
        .setHover("show_text", `&fTrue time taken: &b${Math.floor((Date.now() - trueTimeStarted)/10)/100}`).chat()
        
    blazeStarted = null
    trueTimeStarted = null
    lastBlazeCount = 10
})