import { getMatchFromLines, getSlotCenter } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const trigger = register("guiRender", () => {
    let inv = Player.getOpenedInventory()
    if (!inv || inv.getName() !== "New Year Cake Bag") return
    let cakes = inv.getItems().map((a, i) => a?.getName()?.removeFormatting()?.startsWith("New Year Cake") ? i : null).filter(a => a !== null)
    cakes.map(a => {
        let [x, y] = getSlotCenter(a)
        let item = inv.getStackInSlot(a)
        let match = item.getName().removeFormatting().match(/New Year Cake \(Year (\d+)\)/)
        if (!match) return
        let year = match[1]
        Renderer.retainTransforms(true)
        let cakeStr = `&e&l${year}`
        Renderer.translate(x, y+2, 300)
        Renderer.scale(0.8, 0.8)
        let len = Renderer.getStringWidth(cakeStr.removeFormatting())
        Renderer.translate(-len/2, 0)
        Renderer.drawRect(Renderer.color(0, 0, 0, 128), -1, -1, len+2, 9)
        Renderer.drawString(cakeStr, 0, 0)
        Renderer.retainTransforms(false)
    })
}).unregister()

if (Config.cakeNumbers) {
    trigger.register()
}

Config.registerListener("Cake Numbers", state => {
    if (state) {
        trigger.register()
    }
    else {
        trigger.unregister()
    }
})