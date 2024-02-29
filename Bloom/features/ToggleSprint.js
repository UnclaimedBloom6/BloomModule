import { registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { data } from "../utils/Utils"

export const forwardKey = new KeyBind(Client.getMinecraft().field_71474_y.field_74351_w)

register("tick", () => {
if (!Config.toggleSprint) return
    net.minecraft.client.settings.KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_151444_V.func_151463_i(), true)
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
