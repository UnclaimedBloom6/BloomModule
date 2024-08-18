import { appendToFile, EntityArmorStand } from "../../BloomCore/utils/Utils";
import Config from "../Config";

const S0FPacketSpawnMob = Java.type("net.minecraft.network.play.server.S0FPacketSpawnMob")

const enchantRegexes = [
    /^§6[\d,]+$/, // Fire Aspect
    /^§9[\d,]+$/, // Thunderlord
    /^§2[\d,]+$/ // Venomous
]

const handleArmorStand = (entityID) => {
    const entity = World.getWorld().func_73045_a(entityID)
    if (!entity || !(entity instanceof EntityArmorStand)) return
    const name = entity.func_95999_t()
    if (!name) return

    if (Config.hideGrayDamageNumbers && name.match(/^§7[\d,]+$/)) {
        entity.func_70106_y()
        return
    }
    
    if (Config.hideEnchantDamageNumbers && enchantRegexes.some(a => a.test(name))) {
        entity.func_70106_y()
        return
    }
}

const entityListener = register("packetReceived", (packet, event) => {
    if (!Config.hideGrayDamageNumbers && !Config.hideEnchantDamageNumbers) return
    Client.scheduleTask(0, () => handleArmorStand(packet.func_149024_d()))
}).setFilteredClass(S0FPacketSpawnMob).unregister()

Config.registerListener("Hide Gray Numbers", state => {
    if (state) entityListener.register()
    else if (!Config.hideGrayDamageNumbers) entityListener.unregister()
})

Config.registerListener("Hide Enchants Damage", state => {
    if (state) entityListener.register()
    else if (!Config.hideGrayDamageNumbers) entityListener.unregister()
})

if (Config.hideGrayDamageNumbers || Config.hideEnchantDamageNumbers) {
    entityListener.register()
}