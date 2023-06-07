import Party from "../../BloomCore/Party"
import { prefix } from "../utils/Utils"

let commands = {
    "d": "warp dungeon_hub",
    "dung": "warp dungeon_hub",
    "go": "g online",
    "/ai": "p settings allinvite",
    "f1": "joindungeon catacombs 1",
    "f2": "joindungeon catacombs 2",
    "f3": "joindungeon catacombs 3",
    "f4": "joindungeon catacombs 4",
    "f5": "joindungeon catacombs 5",
    "f6": "joindungeon catacombs 6",
    "f7": "joindungeon catacombs 7",
    "m1": "joindungeon master_catacombs 1",
    "m2": "joindungeon master_catacombs 2",
    "m3": "joindungeon master_catacombs 3",
    "m4": "joindungeon master_catacombs 4",
    "m5": "joindungeon master_catacombs 5",
    "m6": "joindungeon master_catacombs 6",
    "m7": "joindungeon master_catacombs 7",
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

// Random transfer command
register("command", () => {
    if (!Object.keys(Party.members).length) return ChatLib.chat(`${prefix} &cParty empty!`)
    let a = Object.keys(Party.members).filter(a => a !== Player.getName())
    ChatLib.command(`p transfer ${a[Math.floor(Math.random() * a.length)]}`)
}).setName("ptr")
