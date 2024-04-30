import { renderBoxOutline, renderFilledBox } from "../../BloomCore/RenderUtils";
import { getEtherwarpBlockSuccess, holdingAOTV, registerWhen } from "../../BloomCore/utils/Utils";
import Config from "../Config";

registerWhen(register("renderWorld", () => {
    if (Config.etherwarpOverlayOnlySneak && !Player.isSneaking()) return

    const [success, endBlock] = getEtherwarpBlockSuccess(Config.etherwarpSyncWithServer, 61)
    if (!success && !Config.etherwarpShowFailLocation || endBlock == null) return
    
    const [x, y, z] = endBlock
    let [r, g, b, a] = [Config.etherwarpOverlayColor.getRed()/255, Config.etherwarpOverlayColor.getGreen()/255, Config.etherwarpOverlayColor.getBlue()/255, Config.etherwarpOverlayColor.getAlpha()/255]

    if (!success && Config.etherwarpShowFailLocation) {
        r = Config.etherwarpOverlayFailColor.getRed() / 255
        g = Config.etherwarpOverlayFailColor.getGreen() / 255
        b = Config.etherwarpOverlayFailColor.getBlue() / 255
        a = Config.etherwarpOverlayFailColor.getAlpha() / 255
    }

    if (Config.etherwarpHighlightType == 0) renderBoxOutline(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a, 2, false)
    else if (Config.etherwarpHighlightType == 1) renderBoxOutline(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a, 2, true)
    else if (Config.etherwarpHighlightType == 2) renderFilledBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a*0.2, false)
    else if (Config.etherwarpHighlightType == 3) renderFilledBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a*0.2, true)
    else if (Config.etherwarpHighlightType == 4 || Config.etherwarpHighlightType == 5) {
        let shouldPhase = Config.etherwarpHighlightType == 5
        renderBoxOutline(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a, 2, shouldPhase)
        renderFilledBox(x+0.5, y-0.005, z+0.5, 1.005, 1.01, r, g, b, a*0.2, shouldPhase)
    }
}), () => holdingAOTV() && Config.etherwarpOverlay)