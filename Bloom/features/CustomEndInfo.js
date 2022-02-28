import Dungeon from "../utils/Dungeon";
import Config from "../Config";

const reset = () => {
    dungeonType = null
    floor = null
    bossKilled = null
    time = null
    timePB = "&d&l"
    scorePB = "&d&l"
    score = null
    scoreLetter = null
    cataXP = null
    secretsFound = null
}
let dungeonType = null
let floor = null
let bossKilled = null
let time = null
let timePB = "&d&l"
let scorePB = "&d&l"
let score = null
let scoreLetter = null
let cataXP = null
let secretsFound = null

register("chat", (event) => {
    if (!Dungeon.inDungeon || !Config.customEndInfo) return
    let formatted = ChatLib.getChatMessage(event, true)
    let unformatted = formatted.removeFormatting()
    let noSpaces = unformatted.replace(/ /g, "").replace("Stats", "")

    let voidMsgs = [
        /&r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r/,
        /TheCatacombs-Floor(.+)Stats/,
        /TotalDamageas.+:.+/,
        /Enemies Killed:.+/,
        /Deaths:.+/,
        /\+\d+Bits/,
        /AllyHealing:(.+)/
    ]
    voidMsgs.forEach(msg => {
        if (unformatted.match(msg) || formatted.match(msg) || noSpaces.match(msg)) cancel(event)
    })

    if (/^TheCatacombs-Floor(.{1,3})$/.test(noSpaces)) {
        floor = noSpaces.replace("Stats", "").match(/TheCatacombs-Floor(.{1,3})$/)[1]
        dungeonType = "The Catacombs"
        cancel(event)
    }
    if (/^MasterModeCatacombs-Floor(.{1,3})$/.test(noSpaces)) {
        floor = noSpaces.match(/MasterModeCatacombs-Floor(.{1,3})$/)[1]
        dungeonType = "Master Mode"
        cancel(event)
    }
    if (/^TeamScore:\d+\(.+/.test(noSpaces)) {
        if (noSpaces.includes("(NEWRECORD!)")) {
            scorePB = " &d&l(NEW RECORD!)"
            noSpaces = noSpaces.replace("(NEWRECORD!)", "")
        }
        score = noSpaces.match(/TeamScore:(\d+)\((.+)\)/)[1]
        scoreLetter = noSpaces.match(/TeamScore:(\d+)\((.+)\)/)[2]
        cancel(event)
    }
    if (/☠Defeated(.+)in(.+)/.test(noSpaces)) {
        bossKilled = noSpaces.match(/☠Defeated(.+)in(.+)/)[1].replace("The", "The ")
        time = noSpaces.match(/☠Defeated(.+)in(.+)/)[2]
        if (time.includes("(NEWRECORD!)")) {
            timePB = " &d&l(NEW RECORD!)"
            time = time.replace("(NEWRECORD!)", "")
        }
        time = time.replace("00m", "").replace("m", "m ").replace(new RegExp(/^0/), "")
        cancel(event)
    }
    if (/\+(.+)CatacombsExperience/.test(noSpaces)) {
        cataXP = noSpaces.match(/\+(.+)CatacombsExperience/)[1]
        cancel(event)
    }
    if (/\+[\d,.]+.+Experience/.test(noSpaces)) cancel(event)
    if (unformatted == "                             > EXTRA STATS <") {
        ChatLib.command("showextrastats")
        cancel(event)   
    }   
    if (/^SecretsFound:(\d+)/.test(noSpaces)) {
        secretsFound = noSpaces.match(/SecretsFound:(\d+)/)[1]
        cancel(event)

        let msg = bossKilled && time ? `&aDefeated &c${bossKilled} &ain: &e${time}${timePB}` : `&c&lFAILED - &e${Dungeon.time}`

        ChatLib.chat(`&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
        ChatLib.chat(ChatLib.getCenteredText(`&c${dungeonType} - &eFloor ${floor}`))
        ChatLib.chat(`&a&d&b&d&e&k&b`)
        new Message(new TextComponent(ChatLib.getCenteredText(msg)).setHover("show_text", `&8+&3${cataXP} Catacombs Experience`)).chat()
        ChatLib.chat(ChatLib.getCenteredText(`&aScore: &6${score} &a(&b${scoreLetter}&a)${scorePB}`))
        ChatLib.chat(ChatLib.getCenteredText(`&fSecrets Found: &b${secretsFound}`))
        ChatLib.chat(`&r&r&r&r&r&r&r`)
        ChatLib.chat(`&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
        
        reset()
    }
})
register("worldLoad", () => reset())
