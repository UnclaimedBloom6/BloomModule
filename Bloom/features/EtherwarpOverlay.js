import { getEtherwarpBlock, holdingAOTV, registerWhen } from "../../BloomCore/utils/Utils";
import RenderLib from "../../RenderLib";
import Config from "../Config";

registerWhen(register("renderWorld", () => {
    if (Config.etherwarpOverlayOnlySneak && !Player.isSneaking()) return
    const block = getEtherwarpBlock(true)
    if (!block) return
    const [x, y, z] = block

    if (Config.etherwarpHighlightType == 0) RenderLib.drawEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, 0, 1, 0, 1, false)
    else if (Config.etherwarpHighlightType == 1) RenderLib.drawEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, 0, 1, 0, 1, true)
    else if (Config.etherwarpHighlightType == 2) RenderLib.drawInnerEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, 0, 1, 0, 0.5, false)
    else if (Config.etherwarpHighlightType == 3) RenderLib.drawInnerEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, 0, 1, 0, 0.5, true)

}), () => holdingAOTV() && Config.etherwarpOverlay)