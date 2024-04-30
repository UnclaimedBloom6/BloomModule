import { data } from "../utils/Utils"
import Config from "../Config"
import Skyblock from "../../BloomCore/Skyblock"
import { registerWhen } from "../../BloomCore/utils/Utils"
import ScalableGui from "../../BloomCore/utils/ScalableGui"


let speedStr = null
const editGui = new ScalableGui(data, data.speedDisplay).setCommand("bloomeditspeedoverlay")

register("tick", () => {
    if (!Config.speedDisplay || !Skyblock.inSkyblock) return speedStr = null
    const walkSpeed = Player.getPlayer().field_71075_bZ.func_75094_b()
    speedStr = `&f✦${Math.floor(walkSpeed * 1000)}`
})

const renderSpeed = (str=null) => {
    if (str == null) str = `&f✦500`

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    Renderer.drawStringWithShadow(str, 0, 0)
}

editGui.onRender(renderSpeed, false)

registerWhen(register("renderOverlay", () => {
    if (!speedStr) return
    renderSpeed(speedStr)
}), () => speedStr)
