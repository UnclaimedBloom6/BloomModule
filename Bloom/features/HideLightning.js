import Config from "../Config"

class HideLightning {
    constructor() {
        register("renderEntity", (entity, pos, ticks, event) => {
            if (Config.hideLightning && entity.getClassName() == "EntityLightningBolt") {
                cancel(event)
            }
        })
    }
}
export default new HideLightning()