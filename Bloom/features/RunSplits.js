import Dungeon from "../utils/Dungeon";
import Config from "../Config";
import { data, getSecs } from "../utils/Utils";

class RunSplits {
    constructor() {

        this.lastSplit = null
        this.splitIndex = 0
        this.splitMsg = ""
        this.currentSplit = ""

        this.splits = {
            "7": {
                "[BOSS] Necron: FINE! LET'S MOVE TO SOMEWHERE ELSE!!": "&aPhase 1",
                "[BOSS] Necron: CRAP!! IT BROKE THE FLOOR!": "&bPhase 2",
                "[BOSS] Necron: THAT'S IT YOU HAVE DONE IT!": "&cPhase 3",
                "                             > EXTRA STATS <": "&4Phase 4",
            },
            "6": {
                "[BOSS] Sadan: ENOUGH!": "&6Terracottas",
                "[BOSS] Sadan: You did it. I understand now, you have earned my respect.": "&dGiants",
                "                             > EXTRA STATS <": "&cSadan"
            },
            "5": {
                "                             > EXTRA STATS <": "&cBoss Fight"
            },
            "4": {
                "                             > EXTRA STATS <": "&cBoss Fight"
            },
            "3": {
                "[BOSS] The Professor: Oh? You found my Guardians one weakness?": "&9Guardians",
                "[BOSS] The Professor: I see. You have forced me to use my ultimate technique.": "&eProfessor",
                "[BOSS] The Professor: What?! My Guardian power is unbeatable!": "&aBoss Dead",
                "                             > EXTRA STATS <": "&cDialogue"
            },
            "2": {
                "[BOSS] Scarf: Those toys are not strong enough I see.": "&cUndeads",
                "                             > EXTRA STATS <": "&cScarf"
            },
            "1": {
                "                             > EXTRA STATS <": "&cBoss Fight"
            },
            "0": {
                "                             > EXTRA STATS <": "&cBoss Fight"
            }
        }

        register("chat", (event) => {
            if (!Dungeon.inDungeon || this.splitIndex == Object.keys(this.splits[Dungeon.floorInt]).length) { return }

            let formatted = ChatLib.getChatMessage(event)
	        let unformatted = ChatLib.removeFormatting(formatted)
            if (unformatted == Object.keys(this.splits[Dungeon.floorInt])[this.splitIndex]) {
                this.splitMsg += `${this.splits[Dungeon.floorInt][Object.keys(this.splits[Dungeon.floorInt])[this.splitIndex]]}: ${getSecs(new Date().getTime() - this.lastSplit)}\n`
                this.splitIndex++
                this.lastSplit = new Date().getTime()
            }
            

        })

        register("renderOverlay", () => {
            if (!Config.runSplitsMoveGui.isOpen() && (!Config.runSplits || !Dungeon.inDungeon || !Dungeon.bossEntry)) return
            this.render()
        })

        register("tick", () => {
            if (!this.lastSplit && Dungeon.bossEntry) {
                this.lastSplit = Dungeon.bossEntry
            }
        })

        register("dragged", (dx, dy, x, y) => {
            if (Config.runSplitsMoveGui.isOpen()) {
                data.runSplits.x = x
                data.runSplits.y = y
                data.save()
            }
        })

        register("worldLoad", () => this.reset())

    }
    render() {
        // ChatLib.chat(`${new Date().getTime()} | ${this.lastSplit}`)
        if (this.splitIndex == Object.keys(this.splits[Dungeon.floorInt]).length) {
            this.currentSplit = ""
        }
        else {
            this.currentSplit = `${this.splits[Dungeon.floorInt][Object.keys(this.splits[Dungeon.floorInt])[this.splitIndex]]}: ${getSecs(new Date().getTime() - this.lastSplit)}`
        }
        
        Renderer.drawString(`&6&lRun Splits\n` +
                            this.splitMsg +
                            this.currentSplit,
                            data.runSplits.x,
                            data.runSplits.y
        )
    }
    reset() {
        this.lastSplit = null
        this.splitIndex = 0
        this.splitMsg = ""
        this.currentSplit = ""
    }
}
export default new RunSplits()