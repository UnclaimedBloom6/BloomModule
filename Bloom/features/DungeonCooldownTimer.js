import Dungeon from "../../BloomCore/dungeons/Dungeon"
import { stripRank } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import { prefix, data } from "../utils/Utils"

register("dragged", (dx, dy, x, y) => {
    if (!Config.cooldownMoveGui.isOpen()) return
    data.dungeonWarpCooldown.x = x
    data.dungeonWarpCooldown.y = y
    data.save()
})

if (!data.dungeonWarps) {
    data.dungeonWarps = {}
    data.save()
}
// &a[VIP] Unclaimedd&r&e warped the party to a SkyBlock dungeon!&r
const addWarp = (name, formatted) => {
    data.dungeonWarps[name] = {"lastWarp": new Date().getTime(), "formatted": formatted}
    data.save()
}
const getWarpTime = (player) => 70 - Math.floor((new Date().getTime() - data.dungeonWarps[player].lastWarp) / 1000)
register("chat", (event) => {
    let player = ChatLib.getChatMessage(event, true).match(/(.+)&e warped the party to a SkyBlock dungeon!&r/)[1]
    let uf = stripRank(player.removeFormatting())
    addWarp(uf, player)
}).setCriteria("${*} warped the party to a SkyBlock dungeon!")

register("chat", () => {
    addWarp("You", "&6You")
}).setCriteria("SkyBlock Dungeon Warp (${*} players)")

register("renderOverlay", () => {
    // Renderer.drawString(JSON.stringify(data.dungeonWarps, "", 4), data.dungeonWarpCooldown.x, data.dungeonWarpCooldown.y)
    if ((!Config.dungeonCooldown || !Object.keys(data.dungeonWarps).length) && !Config.cooldownMoveGui.isOpen()) return
    Renderer.drawString(`&6&lWarp Cooldown\n` + Object.keys(data.dungeonWarps).map(a => `${data.dungeonWarps[a].formatted}: &d${getWarpTime(a)}s`).join("\n"), data.dungeonWarpCooldown.x, data.dungeonWarpCooldown.y)
})

register("step", () => {
    for (let i of Object.keys(data.dungeonWarps)) {
        if (getWarpTime(i) >= 0) continue
        delete data.dungeonWarps[i]
        data.save()
    }
})

let rsFloor = null
let restarting = false

const restart = (floor, reparty) => {
    if (floor == "stop") {
        rsFloor = null
        restarting = false
        ChatLib.chat(`${prefix} &aNo longer restarting!`)
        return
    }
    if (!floor && Dungeon.floor) rsFloor = Dungeon.floor.toLowerCase()
    else rsFloor = floor
    ChatLib.chat(`${prefix} &aRestarting &b${rsFloor} &aafter cooldown is over!`)

    if (reparty) {
        ChatLib.command("/rp", true)
        setTimeout(() => {
            restarting = true
        }, 3000);
    }
    else restarting = true
}
register("command", (floor) => restart(floor, true)).setName("rs")
register("command", (floor) => restart(floor, false)).setName("/rs")

register("tick", () => {
    if (!restarting || !rsFloor || Object.keys(data.dungeonWarps).includes("You")) return
    ChatLib.command(rsFloor, true)
    World.playSound("random.orb", 1, 1)
    restarting = false
    rsFloor = null
})
