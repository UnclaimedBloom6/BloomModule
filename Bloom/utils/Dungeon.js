import { getTabList } from "./Utils"

class Dungeon {
    constructor() {
        
        this.reset()
        this.entryMessages = [
            "[BOSS] Bonzo: Gratz for making it this far, but I’m basically unbeatable.",
            "[BOSS] Scarf: This is where the journey ends for you, Adventurers.",
            "[BOSS] The Professor: I was burdened with terrible news recently...",
            "[BOSS] Thorn: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!",
            "[BOSS] Livid: Welcome, you arrive right on time. I am Livid, the Master of Shadows.",
            "[BOSS] Sadan: So you made it all the way here...and you wish to defy me? Sadan?!",
            "[BOSS] Necron: Finally, I heard so much about you. The Eye likes you very much."
        ]

        register("chat", (event) => {
            let formatted = ChatLib.getChatMessage(event)
            let unformatted = ChatLib.removeFormatting(formatted)
            if (unformatted.match(/\[NPC\] Mort: Here, I found this map when I first entered the dungeon\./)) this.runStarted = new Date().getTime()
            if (unformatted.match(/\[BOSS\] The Watcher/) && !this.bloodOpen) this.bloodOpen = new Date().getTime()
            if (unformatted == "[BOSS] The Watcher: You have proven yourself. You may pass.") this.watcherDone = new Date().getTime()
            if (unformatted.match(/.+ opened a WITHER door\!/)) this.openedWitherDoors++
            if (this.entryMessages.includes(unformatted)) this.bossEntry = new Date().getTime()
            if (unformatted == "                             > EXTRA STATS <") this.runEnded = new Date().getTime()
        })

        register("tick", () => {
            let scoreboard = Scoreboard.getLines().map(a => ChatLib.removeFormatting(a))
            let lines = getTabList()

            for (let line of scoreboard) {
                let match = line.match(/ ⏣ The Catac.+ombs \((.+)\)/)
                if (match) {
                    this.inDungeon = true
                    this.floor = match[1]
                    this.floorInt = parseInt(this.floor.replace(/[^\d]/g, ""))
                }
            }

            if (!this.inDungeon) return this.reset()
            try {
                this.party = [5, 9, 13, 17, 1].map(line => lines[line].replace(/\[\w+\] /, "").trim().split(" ")[0]).filter(player => player !== "")
                this.puzzles = [47, 48, 49, 50, 51].map(line => lines[line]).filter(line => line !== "")
                this.time = lines[44].match(/Time: (.+)/)[1]
                this.seconds = parseInt(this.time.match(/(\d+)m (\d+)s/)[1]) * 60 + parseInt(this.time.match(/(\d+)m (\d+)s/)[2])
                this.secretsFound = parseInt(lines[31].match(/ Secrets Found: (\d+)/)[1])
                this.crypts = parseInt(lines[32].match(/ Crypts: (\d+)/)[1])
                this.deaths = parseInt(lines[25].match(/Deaths: \((\d+)\)/)[1])
                this.discoveries = parseInt(lines[30].match(/Discoveries: \((\d+)\)/)[1])
                this.milestone = 0
                this.openedRooms = parseInt(lines[42].match(/ Opened Rooms: (\d+)/)[1])
                this.completedRooms = parseInt(lines[43].match(/ Completed Rooms: (\d+)/)[1])
            }
            catch(error) {}
        })
        register("worldLoad", () => {
            this.reset()
        })
    }
    reset() {
        this.inDungeon = false
        this.floor = ""
        this.floorInt = 0
        this.time = ""
        this.seconds = 0
        this.party = []
        this.puzzles = {}
        this.secretsFound = 0
        this.crypts = 0
        this.deaths = 0
        this.discoveries = 0
        this.milestone = 0
        this.openedRooms = 0
        this.completedRooms = 0

        // ------------------------------------------

        this.openedWitherDoors = 0
        this.runStarted = null
        this.bloodOpen = null
        this.watcherDone = null
        this.bossEntry = null
        this.runEnded = null
    }
    print() {
        ChatLib.chat(`inDungeon: ${this.inDungeon}`)
        ChatLib.chat(`floor: ${this.floor}`)
        ChatLib.chat(`time: ${this.time}`)
        ChatLib.chat(`party: ${this.party}`)
        ChatLib.chat(`puzzles: ${this.puzzles}`)
        ChatLib.chat(`secretsFound: ${this.secretsFound}`)
        ChatLib.chat(`crypts: ${this.crypts}`)
        ChatLib.chat(`deaths: ${this.deaths}`)
        ChatLib.chat(`discoveries: ${this.discoveries}`)
        ChatLib.chat(`milestone: ${this.milestone}`)
        ChatLib.chat(`openedRooms: ${this.openedRooms}`)
        ChatLib.chat(`completedRooms: ${this.completedRooms}`)
    }
}
export default new Dungeon()