import Party from "../../BloomCore/Party"
import PriceUtils from "../../BloomCore/PriceUtils"
import { fn, title } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"

let commands = {
    "d": "warp dungeon_hub",
    "dung": "warp dungeon_hub",
    "go": "g online",
    "/ai": "p settings allinvite",
    "f1": "joininstance CATACOMBS_FLOOR_ONE",
    "f2": "joininstance CATACOMBS_FLOOR_TWO",
    "f3": "joininstance CATACOMBS_FLOOR_THREE",
    "f4": "joininstance CATACOMBS_FLOOR_FOUR",
    "f5": "joininstance CATACOMBS_FLOOR_FIVE",
    "f6": "joininstance CATACOMBS_FLOOR_SIX",
    "f7": "joininstance CATACOMBS_FLOOR_SEVEN",
    "m1": "joininstance MASTER_CATACOMBS_FLOOR_ONE",
    "m2": "joininstance MASTER_CATACOMBS_FLOOR_TWO",
    "m3": "joininstance MASTER_CATACOMBS_FLOOR_THREE",
    "m4": "joininstance MASTER_CATACOMBS_FLOOR_FOUR",
    "m5": "joininstance MASTER_CATACOMBS_FLOOR_FIVE",
    "m6": "joininstance MASTER_CATACOMBS_FLOOR_SIX",
    "m7": "joininstance MASTER_CATACOMBS_FLOOR_SEVEN",
    "va": "viewauction",
    "pko": "p kickoffline",
    "pd": "p disband",
    "/ai": "p settings allinvite"
}
Object.keys(commands).forEach(cmd => {
    register("command", (...args) => {
        ChatLib.command(`${commands[cmd]} ${args.join(" ")}`)
    }).setName(cmd)
})

register("command", (player) => ChatLib.command(`p kick ${player}`)).setName("pk")
register("command", (player) => ChatLib.command(`p transfer ${player}`)).setName("pt")

// Colors command
register("command", () => {
    ChatLib.chat("&aa &bb &cc &dd &ee &ff &00 &11 &22 &33 &44 &55 &66 &77 &88 &99 &r&ll &rk&kk&r &mm&r &nn&r &oo &rr")
}).setName("colors")

// lsb and ldung commands
register("command", () => {
    new Thread(() => {
        ChatLib.command("l")
        Thread.sleep(500)
        ChatLib.command("play sb")
    }).start()
}).setName("lsb")

register("command", () => {
    new Thread(() => {
        ChatLib.command("l")
        Thread.sleep(500)
        ChatLib.command("play sb")
        Thread.sleep(1000)
        ChatLib.command("warp dungeon_hub")
    }).start()
}).setName("ld")

// ID Command
register("command", () => {
    let block = Player.lookingAt()
    if (block.getClass() === Block) {
        ChatLib.chat(block.type.getID())
    }
}).setName("id")

register("command", () => {
    const la = Player.lookingAt()
    if (!la || !(la instanceof Block)) {
        ChatLib.chat(`Not looking at anything!`)
        return
    }
    const id = la.type.getID()
    const name = la.type.getRegistryName()
    const meta = la.getMetadata()

    ChatLib.chat(`${name} (${id}:${meta})`)
}).setName("blockinfo")

// Random transfer command
register("command", () => {
    if (!Object.keys(Party.members).length) return ChatLib.chat(`${prefix} &cParty empty!`)
    let a = Object.keys(Party.members).filter(a => a !== Player.getName())
    ChatLib.command(`p transfer ${a[Math.floor(Math.random() * a.length)]}`)
}).setName("ptr")


register("command", () => {
    const held = Player.getHeldItem()
    if (!held) return

    const price = PriceUtils.getItemValue(held.itemStack, true)
    if (price == null) return ChatLib.chat(`&cCould not calculate value for ${held.getName()}`)

    let [value, breakdown] = price
    const breakdownStr = Object.entries(breakdown).map(([k, v]) => `  &a${title(k)}&r: &6${fn(Math.floor(v))}`).join("\n")
    ChatLib.chat(`${held.getName()}&r: &6${fn(Math.floor(value))}\n${breakdownStr}`)
}).setName("heldvalue")

// Rng Meter Command
register("command", (floor) => {
    if (!floor) floor = ""
    ChatLib.command(`rng cata ${floor}`, false)
}).setName("rngc")

register("command", (boss) => {
    if (!boss) boss = ""
    ChatLib.command(`rng cata ${boss}`, false)
}).setTabCompletions(["zombie", "spider", "tarantula", "enderman", "wolf", "vampire", "blaze"]).setName("rngs")