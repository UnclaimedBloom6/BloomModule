import { registerWhen } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const EntityLightningBolt = Java.type("net.minecraft.entity.effect.EntityLightningBolt")

registerWhen(register("renderEntity", (entity, pos, ticks, event) => {
    cancel(event)
}).setFilteredClass(EntityLightningBolt), () => Config.hideLightning)