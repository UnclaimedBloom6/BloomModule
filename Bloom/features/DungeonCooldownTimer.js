import Config from "../Config"
import { prefix, data } from "../utils/Utils"

class DungeonCooldownTimer {
    constructor() {
        this.lastWarp = null
        this.cooldown = 70
        
        this.restarting = false
        this.rsFloor = null

        register("chat", () => {
            this.lastWarp = new Date().getTime()
        }).setCriteria("SkyBlock Dungeon Warp (${*} players)")

        register("renderOverlay", () => {
            if (!Config.dungeonCooldown) return
            let timeSince = Math.floor(70 - (new Date().getTime() - this.lastWarp) / 1000)
            if (!this.lastWarp || timeSince < 0) {
                if (this.restarting) {
                    ChatLib.command(`${this.rsFloor}`, true)
                    this.restarting = false
                    this.rsFloor = null
                    World.playSound("random.orb", 1, 1)
                }
                return
            }
            if (Config.dungeonCooldown || Config.cooldownMoveGui.isOpen()) {
                Renderer.drawStringWithShadow(`&bCooldown: ${timeSince}`, data.dungeonWarpCooldown.x, data.dungeonWarpCooldown.y)
            }
        })
        
        register("dragged", (dx, dy, x, y) => {
            if (Config.cooldownMoveGui.isOpen()) {
                data.dungeonWarpCooldown.x = x
                data.dungeonWarpCooldown.y = y
                data.save()
            }
        })

        register("command", (floor, reparty) => {
            if (!floor) return ChatLib.chat(`${prefix} &a//rs <floor> [dont reparty?]`)
            if (floor == "stop") {
                this.restarting = false
                this.rsFloor = null
                return
            }
            new Thread(() => {
                ChatLib.chat(`${prefix} &aRestarting &b${floor} &aafter cooldown is over!`)
                if (!reparty || reparty.trim() == "") {
                    ChatLib.command("/rp", true)
                    Thread.sleep(4000)
                }
                this.restarting = true
                this.rsFloor = floor
            }).start()
        }).setName("/rs")

    }
}
export default new DungeonCooldownTimer()