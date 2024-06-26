import PriceUtils from "../../BloomCore/PriceUtils";
import { fn } from "../../BloomCore/utils/Utils";
import Config from "../Config";


register("postGuiRender", () => {
    if (!Config.itemValueOverlay) return

    const inv = Player.getContainer()

    const slot = Client.currentGui.getSlotUnderMouse()
    if (!slot) return

    const item = inv.getStackInSlot(slot.getIndex())
    if (!item) return

    const itemValueInfo = PriceUtils.getItemValue(item, true)
    
    if (!itemValueInfo || !itemValueInfo[0]) return

    const [value, breakdown] = itemValueInfo

    let str = `${item.getName()}\n`
    str += ` &dValue: &6${fn(Math.floor(value))}\n`
    str += ` &bBreakdown:\n`
    Object.entries(breakdown).forEach(([k, v]) => {
        str += `  &e${k}: ${fn(Math.floor(v))}\n`
    })

    Renderer.translate(10, 10)
    Renderer.drawString(str, 0, 0)
})