import { getEtherwarpBlock, holdingAOTV, registerWhen } from "../../BloomCore/utils/Utils";
import RenderLib from "../../RenderLib";
import Config from "../Config";

registerWhen(register("renderWorld", () => {
    if (Config.etherwarpOverlayOnlySneak && !Player.isSneaking()) return
    let block = null
    if (Config.etherwarpSyncWithServer) block = getEtherwarpBlock(true, 61)
    else block = getEtherwarpBlock(false, 61)
    if (!block) return
    
    const [x, y, z] = block
    const [r, g, b, a] = [Config.etherwarpOverlayColor.getRed()/255, Config.etherwarpOverlayColor.getGreen()/255, Config.etherwarpOverlayColor.getBlue()/255, Config.etherwarpOverlayColor.getAlpha()/255]

    if (Config.etherwarpHighlightType == 0) RenderLib.drawEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a, false)
    else if (Config.etherwarpHighlightType == 1) RenderLib.drawEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a, true)
    else if (Config.etherwarpHighlightType == 2) RenderLib.drawInnerEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a, false)
    else if (Config.etherwarpHighlightType == 3) RenderLib.drawInnerEspBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a, true)

}), () => holdingAOTV() && Config.etherwarpOverlay)