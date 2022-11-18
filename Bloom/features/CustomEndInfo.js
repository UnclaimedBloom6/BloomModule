import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { fn } from "../../BloomCore/utils/Utils";
import Config from "../Config";

const toDelete = [
    /^▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬$/,
    /^Deaths: \d+$/,
    /^Total Damage as .+: [\d.,]+$/,
    /^Ally Healing: [\d,.]+$/,
    /^\+0 Experience \(No Class Milestone Reached\)$/
]

class Data {
    constructor() {
        this.reset()
    }
    reset() {
        this.score = null
        this.floor = null
        this.scoreLetter = null
        this.bossKilled = null
        this.time = null
        this.bitsFound = null
        this.cataXP = null
        this.classXP = [] // [[xp, class], [xp, class]...]
        this.classStat = null
        this.enemiesKilled = null
        this.deaths = null
        this.secretsFound = null
        this.timePB = false
        this.scorePB = false
    }
}

let endData = new Data()

const testMessage = (eventToCancel, message, regex, defaultValue, type) => {
    let match = message.match(regex)
    if (!match) return defaultValue
    cancel(eventToCancel)
    let val = match[1]
    return type == "int" ? parseInt(val) : type == "float" ? parseFloat(val) : val
}
const centre = (text) => ChatLib.getCenteredText(text)
register("chat", (e) => {
    if (!Config.customEndInfo || !Dungeon.inDungeon) return
    let formatted = ChatLib.getChatMessage(e)
    let msg = formatted.removeFormatting()
    while (msg[0] == " ") msg = msg.slice(1)
    let noCommas = msg.replace(/,/g, "")

    if (toDelete.some(a => msg.match(a))) return cancel(e)

    if (msg.startsWith("Team Score: ")) {
        let match = msg.match(/Team Score: (\d+) \((.{1,2})\)/)
        let [m, score, letter] = match
        endData.score = score
        endData.scoreLetter = letter
        if (letter.includes("(NEW RECORD)")) {
            endData.scorePB = true
        }
        cancel(e)
    }

    if (msg.startsWith("☠ Defeated ")) {
        let match = msg.match(/☠ Defeated (.+) in (.+s)/)
        let [m, boss, time] = match
        endData.time = time
        endData.bossKilled = boss
        if (time.includes("(NEW RECORD)")) {
            endData.timePB = true
        }
        cancel(e)
    }
    let typematch = msg.match(/([The Catacombs|Master Mode]+) - Floor (\w{1,3})/)
    if (typematch) {
        endData.floor = typematch[2]
        cancel(e)
    }

    endData.bitsFound = testMessage(e, msg, /\+(\d+) Bits/, endData.bitsFound, "int")
    endData.cataXP = testMessage(e, noCommas, /\+([\d.]+) Catacombs Experience/, endData.cataXP, "float")
    let classXPMatch = noCommas.match(/\+([\d.]+) ([Mage|Archer|Tank|Berserk|Healer]+) Experienc.+/)
    if (classXPMatch) {
        let [m, xp, classs] = classXPMatch
        endData.classXP.push([parseFloat(xp), classs])
        cancel(e)
    }
    endData.enemiesKilled = testMessage(e, msg, /Enemies Killed: (\d+)/, endData.enemiesKilled, "int")
    endData.secretsFound = testMessage(e, msg, /Secrets Found: (\d+)/, endData.secretsFound, "int")

    if (msg == "> EXTRA STATS <") {
        cancel(e)
        ChatLib.command("showextrastats")
    }
    let secretMatch = msg.match(/^Secrets Found: (\d+)/)
    if (secretMatch) {
        endData.secretsFound = parseInt(secretMatch[1])
        let comp = endData.bossKilled ? `&aDefeated &c${endData.bossKilled} &ain &e${endData.time.replace(/^0/, "")}${endData.timePB ? " &d&l(NEW RECORD)" : ""}` : `&c&lFAILED &a- &e${Dungeon.time}`
        let compHover = ""
        if (endData.bitsFound) compHover += `&b+${endData.bitsFound} Bits\n`
        compHover += `&3+${fn(endData.cataXP)} Catacombs XP\n`
        compHover += endData.classXP.map(a => `&3+${fn(a[0])} ${a[1]} XP`).join("\n")
        ChatLib.chat(`&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
        ChatLib.chat(centre(`&c${Dungeon.dungeonType} - &eFloor ${endData.floor}`))
        ChatLib.chat("&c&c&c&d&e&f&c")
        ChatLib.chat(new TextComponent(centre(comp)).setHover("show_text", compHover))
        ChatLib.chat(centre(`&aScore: &6${endData.score} &a(&b${endData.scoreLetter}&a)${endData.scorePB ? " &d&l(NEW RECORD)" : ""}`))
        ChatLib.chat(centre(`&fSecrets Found: &b${endData.secretsFound}`))
        ChatLib.chat(`&r&r&r&r&r&r&r`)
        ChatLib.chat(`&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
    }
})

register("worldUnload", () => endData.reset())
