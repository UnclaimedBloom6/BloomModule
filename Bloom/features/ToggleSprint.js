import { registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"

export const forwardKey = new KeyBind(Client.getMinecraft().field_71474_y.field_74351_w)

register("tick", () => {
    if (!Config.toggleSprint || !forwardKey.isKeyDown()) return
    Player.getPlayer().func_70031_b(true)
})

register("dragged", (mx, my, x, y) => {
    if (!Config.toggleSprintMove.isOpen()) return
    data.toggleSprint.x = x
    data.toggleSprint.y = y
    data.save()
})

registerWhen(register("renderOverlay", () => {
    if (!Config.toggleSprint || !Config.toggleSprintText || !Config.toggleSprintOverlay) return
    Renderer.drawString(Config.toggleSprintText, data.toggleSprint.x, data.toggleSprint.y)
}), () => Config.toggleSprint && Config.toggleSprintText && Config.toggleSprintOverlay)