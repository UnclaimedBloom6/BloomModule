import { EntityArmorStand } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const S1CPacketEntityMetadata = Java.type("net.minecraft.network.play.server.S1CPacketEntityMetadata")
const JavaString = Java.type("java.lang.String")

const healthMatches = [
    /^§.\[§.Lv\d+§.\] §.+ (?:§.)+0§f\/.+§c❤$/,
    /^.+ (?:§.)+0§c❤$/
]

register("packetReceived", (packet, event) => {
    if (!Config.hide0HealthNametags) return
    
    const list = packet.func_149376_c()
    if (!list) return
    list.forEach(thing => {
        const object = thing.func_75669_b() // getObject
        const type = thing.func_75674_c()
        // https://regex101.com/r/TwvICo/2
        if (type !== 4 || !(object instanceof JavaString) || !healthMatches.some(a => object.match(a))) return

        const entityID = packet.func_149375_d() // getEntityId
        const entity = World.getWorld().func_73045_a(entityID)
        if (!entity || !(entity instanceof EntityArmorStand)) return

        // ChatLib.chat(`Killed!`)
        entity.func_70106_y()
        cancel(event)
    })
}).setFilteredClass(S1CPacketEntityMetadata)