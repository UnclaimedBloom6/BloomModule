import Config from "../Config"

register("renderEntity", (entity, pos, ticks, event) => {
    if (Config.hideLightning && entity.getClassName() == "EntityLightningBolt") {
        cancel(event)
    }
})