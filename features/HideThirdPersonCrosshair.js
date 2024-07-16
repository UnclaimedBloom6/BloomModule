import { getGameSettings } from "../../BloomCore/utils/Utils"
import Config from "../Config"

register("renderCrosshair", (event) => {
    if (!Config.hideThirdPersonCrosshair || getGameSettings().field_74320_O == 0) return
    cancel(event)
})