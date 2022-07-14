import Config from "../Config"

const EntityLightningBolt = Java.type("net.minecraft.entity.effect.EntityLightningBolt")

register("renderEntity", (entity, pos, ticks, event) => {
    if (!Config.hideLightning || entity.getClassName() !== "EntityLightningBolt") return
    cancel(event)
})