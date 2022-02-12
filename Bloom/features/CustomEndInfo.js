import Dungeon from "../utils/Dungeon";
import Config from "../Config";
class CustomEndInfo {
    constructor() {
        this.reset()
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

            if (/TheCatacombs-Floor(.{1,3})$/.test(noSpaces)) {
                this.floor = noSpaces.replace("Stats", "").match(/TheCatacombs-Floor(.{1,3})$/)[1]
                this.dungeonType = "The Catacombs"
                cancel(event)
            }
            if (/MasterModeCatacombs-Floor(.{1,3})$/.test(noSpaces)) {
                this.floor = noSpaces.match(/MasterModeCatacombs-Floor(.{1,3})$/)[1]
                this.dungeonType = "Master Mode"
                cancel(event)
            }
            if (/TeamScore:\d+\(.+/.test(noSpaces)) {
                if (noSpaces.includes("(NEWRECORD!)")) {
                    this.scorePB = " &d&l(NEW RECORD!)"
                    noSpaces = noSpaces.replace("(NEWRECORD!)", "")
                }
                this.score = noSpaces.match(/TeamScore:(\d+)\((.+)\)/)[1]
                this.scoreLetter = noSpaces.match(/TeamScore:(\d+)\((.+)\)/)[2]
                cancel(event)
            }
            if (/☠Defeated(.+)in(.+)/.test(noSpaces)) {
                this.bossKilled = noSpaces.match(/☠Defeated(.+)in(.+)/)[1].replace("The", "The ")
                this.time = noSpaces.match(/☠Defeated(.+)in(.+)/)[2]
                if (this.time.includes("(NEWRECORD!)")) {
                    this.timePB = " &d&l(NEW RECORD!)"
                    this.time = this.time.replace("(NEWRECORD!)", "")
                }
                this.time = this.time.replace("00m", "").replace("m", "m ").replace(new RegExp(/^0/), "")
                cancel(event)
            }
            if (/\+(.+)CatacombsExperience/.test(noSpaces)) {
                this.cataXP = noSpaces.match(/\+(.+)CatacombsExperience/)[1]
                cancel(event)
            }
            if (/\+[\d,.]+.+Experience/.test(noSpaces)) cancel(event)
            if (unformatted == "                             > EXTRA STATS <") {
                ChatLib.command("showextrastats")
                cancel(event)   
            }   
            if (/^SecretsFound:(\d+)/.test(noSpaces)) {
                this.secretsFound = noSpaces.match(/SecretsFound:(\d+)/)[1]
                cancel(event)

                let msg = this.bossKilled && this.time ? `&aDefeated &c${this.bossKilled} &ain: &e${this.time}${this.timePB}` : `&c&lFAILED - &e${Dungeon.time}`

                ChatLib.chat(`&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
                ChatLib.chat(ChatLib.getCenteredText(`&c${this.dungeonType} - &eFloor ${this.floor}`))
                ChatLib.chat(`&a&d&b&d&e&k&b`)
                new Message(new TextComponent(ChatLib.getCenteredText(msg)).setHover("show_text", `&8+&3${this.cataXP} Catacombs Experience`)).chat()
                ChatLib.chat(ChatLib.getCenteredText(`&aScore: &6${this.score} &a(&b${this.scoreLetter}&a)${this.scorePB}`))
                ChatLib.chat(ChatLib.getCenteredText(`&fSecrets Found: &b${this.secretsFound}`))
                ChatLib.chat(`&r&r&r&r&r&r&r`)
                ChatLib.chat(`&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
                
                this.reset()
            }
        })
        register("worldLoad", () => this.reset())
    }
    reset() {
        this.dungeonType = null
        this.floor = null
        this.bossKilled = null
        this.time = null
        this.timePB = "&d&l"
        this.scorePB = "&d&l"
        this.score = null
        this.scoreLetter = null
        this.cataXP = null
        this.secretsFound = null

    }
}
export default new CustomEndInfo()

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// TheCatacombs-FloorV

// TeamScore:138(C)
// ☠DefeatedLividin03m19s
// §r§6>§e§lEXTRASTATS§6<
// +27Bits
// +3,036CatacombsExperience
// +1,170.2MageExperience
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// TheCatacombs-FloorVStats

// TeamScore:138(C)
// ☠DefeatedLividin03m19s

// TotalDamageasMage:39,152,551
// EnemiesKilled:84
// Deaths:0
// SecretsFound:0

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

// [18:04:22] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// [18:04:22]                    Master Mode Catacombs - Floor V
// [18:04:22]                            Team Score: 303 (S+)
// [18:04:22]                        ☠ Defeated Livid in 04m 07s
// [18:04:22]                              > EXTRA STATS <
// [18:04:22]                                    +27 Bits
// [18:04:22]                     +116,655 Catacombs Experience
// [18:04:22]                          +74,942 Mage Experience
// [18:04:22]              +18,735.5 Berserk Experience (Team Bonus)
// [18:04:22]                +18,735.5 Tank Experience (Team Bonus)
// [18:04:22]              +18,735.5 Archer Experience (Team Bonus)
// [18:04:22] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// [18:04:22] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// [18:04:22]                 Master Mode Catacombs - Floor V Stats
// [18:04:22]                            Team Score: 303 (S+)
// [18:04:22]                        ☠ Defeated Livid in 04m 07s
// [18:04:22]                     Total Damage as Mage: 69,193,722
// [18:04:22]                               Enemies Killed: 7
// [18:04:22]                                    Deaths: 0
// [18:04:22]                              Secrets Found: 29
// [18:04:22] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

// [21:24:52] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// [21:24:52]                          The Catacombs - Floor V
// [21:24:52]                             Team Score: 132 (C)
// [21:24:52]                        ☠ Defeated Livid in 05m 22s
// [21:24:52]                              > EXTRA STATS <
// [21:24:52]                                    +27 Bits
// [21:24:52]                       +2,904 Catacombs Experience
// [21:24:52]                         +1,119.4 Mage Experience
// [21:24:52] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// [21:24:52] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// [21:24:52]                      The Catacombs - Floor V Stats
// [21:24:52]                             Team Score: 132 (C)
// [21:24:52]                        ☠ Defeated Livid in 05m 22s
// [21:24:52]                     Total Damage as Mage: 89,465,830
// [21:24:52]                               Enemies Killed: 44
// [21:24:52]                                    Deaths: 0
// [21:24:52]                               Secrets Found: 0
// [21:24:52] ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

// &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
// &r&r&r                         &r&cThe Catacombs &r&8- &r&eFloor V&r
// &r
// &r&r&r                            &r&fTeam Score: &r&a123 &r&f(&r&6C&r&f)&r
// &r&r&r                       &r&c☠ &r&eDefeated &r&cLivid &r&ein &r&a02m 37s&r
// &r&r                             &6> &e&lEXTRA STATS &6<&r
// &r&r&r                                   &r&8+&r&b27 Bits&r
// &r&r&r                      &r&8+&r&32,706 Catacombs Experience&r
// &r&r&r                         &r&8+&r&31,043 Mage Experience&r
// &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
// &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
// &r&r&r                     &r&cThe Catacombs &r&8- &r&eFloor V Stats&r
// &r
// &r&r&r                            &r&fTeam Score: &r&a123 &r&f(&r&6C&r&f)&r
// &r&r&r                       &r&c☠ &r&eDefeated &r&cLivid &r&ein &r&a02m 37s&r
// &r
// &r&r&r                    &r&fTotal Damage as Mage: &r&a29,248,305&r
// &r&r&r                              &r&fEnemies Killed: &r&a56&r
// &r&r&r                                   &r&fDeaths: &r&c0&r
// &r&r&r                              &r&fSecrets Found: &r&b0&r
// &r
// &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
