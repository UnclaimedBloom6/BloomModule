import Dungeon from "../../BloomCore/dungeons/Dungeon";
import Config from "../Config";

const toDelete = [
    /^▬+$/,
    /^\s*Deaths: \d+$/,
    /^\s*Total Damage as .+: [\d,.]+\s?(?:\(NEW RECORD!\))?$/, // https://regex101.com/r/E34jFf/1
    /^\s*Ally Healing: [\d,.]+\s?(?:\(NEW RECORD!\))?$/,
    /^\s*\+0 Experience \(No Class Milestone Reached\)$/,
    /^\s*The Catacombs - .+ Stats$/,
    /^\s*Master Mode Catacombs - .+ Stats$/,
    /^\s*Master Mode The Catacombs - .+ Stats$/,
    /^\s*Enemies Killed: \d+\s?(?:\(NEW RECORD!\))?$/
]

class Data {
    constructor() {
        this.reset()
    }
    reset() {
        this.score = 0
        this.floor = null
        this.masterMode = false
        this.scoreLetter = null
        this.bossKilled = null
        this.time = null
        this.bitsFound = 0
        this.cataXP = 0
        this.xp = [] // ["+41,001 Catacombs Experience", "+29,120 Mage Experience"]
        this.enemiesKilled = 0
        this.deaths = 0
        this.secretsFound = 0
        this.timePB = false
        this.scorePB = false
    }
}

const endData = new Data()

const printEndStats = () => {
    let defeatedText = `&aDefeated &c${endData.bossKilled} &ain &e${endData.time}`
    if (endData.timePB) defeatedText += " &d&l(NEW RECORD!)"

    if (!endData.bossKilled) defeatedText = `&c&lFAILED &a- &e${Dungeon.time}`

    let compHover = ""
    if (endData.bitsFound) compHover += `&b+${endData.bitsFound} Bits\n`
    compHover += endData.xp.join("\n")

    const dungeonMessage = `${endData.masterMode ? "&cMaster Mode" : "&cThe Catacombs"} - &e${endData.floor}`

    let scoreMessage = `&aScore: &6${endData.score} &a(&b${endData.scoreLetter}&a)`
    if (endData.scorePB) scoreMessage += " &d&l(NEW RECORD!)"

    const finalMessage = [
        `&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`,
        ChatLib.getCenteredText(dungeonMessage),
        "&c&c&c&d&e&f&c",
        new TextComponent(ChatLib.getCenteredText(defeatedText)).setHover("show_text", compHover),
        ChatLib.getCenteredText(scoreMessage),
        ChatLib.getCenteredText(`&fSecrets Found: &b${endData.secretsFound}`),
        `&r&r&r&r&r&r&r`,
        `&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`
    ]

    finalMessage.forEach(line => ChatLib.chat(line))
}

// Automatically run /showextrastats
register("chat", (event) => {
    if (!Config.customEndInfo) return
    ChatLib.command("showextrastats")
    cancel(event)
}).setCriteria(/^\s*> EXTRA STATS <$/)

// Useless messages
toDelete.forEach(regex => {
    register("chat", (event) => {
        if (!Config.customEndInfo) return
        cancel(event)
    }).setCriteria(regex)
})

register("chat", (bits, event) => {
    if (!Config.customEndInfo) return
    endData.bitsFound = parseInt(bits)
    cancel(event)
}).setCriteria(/^\s*\+(\d+) Bits$/)

// https://regex101.com/r/RbZslx/1
register("chat", (boss, time, pb, event) => {
    if (!Config.customEndInfo) return
    endData.time = time
    endData.bossKilled = boss
    endData.timePB = !!pb
    cancel(event)
}).setCriteria(/^\s*☠ Defeated (.+) in 0?([\dhms ]+?)\s*(\(NEW RECORD!\))?$/)

register("chat", (deaths, event) => {
    if (!Config.customEndInfo) return
    endData.deaths = deaths
    cancel(event)
}).setCriteria(/^\s*Deaths: (\d+)$/)

// https://regex101.com/r/GgEctB/1
register("chat", (score, rank, pb, event) => {
    if (!Config.customEndInfo) return
    endData.score = score
    endData.scoreLetter = rank
    endData.scorePB = !!pb
    cancel(event)
}).setCriteria(/^\s*Team Score: (\d+) \((.{1,2})\)\s?(\(NEW RECORD!\))?$/)

// https://regex101.com/r/TsoLRV/1
register("chat", (xp, event) => {
    if (!Config.customEndInfo) return
    endData.xp.push(`&3${xp}`)
    cancel(event)
}).setCriteria(/^\s*(\+[\d,.]+\s?\w+ Experience)\s?(?:\(.+\))?$/)

// https://regex101.com/r/W4UjWQ/2
register("chat", (masterMode, floor, event) => {
    if (!Config.customEndInfo) return
    endData.masterMode = !!masterMode
    endData.floor = floor
    cancel(event)
}).setCriteria(/^\s*(Master Mode)? ?(?:The)? Catacombs - (Entrance|Floor .{1,3})$/)

register("chat", (secrets, event) => {
    if (!Config.customEndInfo) return
    endData.secretsFound = parseInt(secrets)
    cancel(event)
    printEndStats()
}).setCriteria(/^\s*Secrets Found: (\d+)$/)

register("worldUnload", () => endData.reset())