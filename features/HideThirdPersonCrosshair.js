import { getGameSettings } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const trigger = register("renderCrosshair", (event) => {
    cancel(event)
}).unregister()

const tickChecker = register("tick", () => {
    if (getGameSettings().field_74320_O !== 0) {
        trigger.register()
    }
    else {
        trigger.unregister()
    }
})

if (Config.hideThirdPersonCrosshair) {
    tickChecker.register()
}

Config.registerListener("Hide Crosshair in Third Person", state => {
    if (state) {
        tickChecker.register()
    }
    else {
        tickChecker.unregister()
    }
})