import PriceUtils from "../../BloomCore/PriceUtils";
import ScalableGui from "../../BloomCore/utils/ScalableGui";
import { fn } from "../../BloomCore/utils/Utils";
import Config from "../Config";
import { data } from "../utils/Utils";

const dummyBreakdown = JSON.parse(`{"base":908999999,"total":1730750165.381092,"recomb":7972100.396296294,"hotPotatoBooks":863239.142857143,"fumings":5969361.726114649,"gemstoneUnlocks":18491660.994852666,"gemstones":27775999.476190478,"scrolls":741672255,"stars":9356973.488849277,"enchantments":{"Luck 6":2142.5523809523806,"Critical 6":1770.8028901734106,"Smite 7":13619993.1,"Looting 4":18123.674782608698,"Syphon 4":347178.05555555556,"Ender Slayer 6":1613996.6928571425,"Giant Killer 6":1311137.3,"Thunderlord 6":3946.8033149171265,"Ultimate Wise 5":2014996.428,"Lethality 6":72264.235}}`)
const editGui = new ScalableGui(data, data.itemValueOverlay).setCommand("edititemvalueoverlay")

const depthColors = [
    "&e",
    "&b",
    "&a",
]

const makeBreakdownLines = (obj, depth=0) => {
    let final = ""
    Object.entries(obj).forEach(([k, v]) => {
        let entry = v
        if (typeof(v) == "object") {
            entry = makeBreakdownLines(v, depth+1)
        }
        else {
            entry = fn(Math.floor(v))
        }
        final += `\n${"  ".repeat(depth+1)}${depthColors[depth]}${k}: &6${entry}`
    })
    return final
}

const renderBreakdown = (breakdown, str="") => {
    str += ` &dValue: &6${fn(Math.floor(breakdown.total))}\n`
    str += ` &bBreakdown:\n`
    str += makeBreakdownLines(breakdown)

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawString(str, 0, 0)
}

editGui.onRender(() => {
    renderBreakdown(dummyBreakdown)
})

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
    renderBreakdown(breakdown, str)
})