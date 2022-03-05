import Dungeon from "../utils/Dungeon";
import Config from "../Config";
import { data, getSecs } from "../utils/Utils";

let lastSplit = null
let splitIndex = 0
let splitMsg = ""
let currentSplit = ""

const reset = () => {
    lastSplit = null
    splitIndex = 0
    splitMsg = ""
    currentSplit = ""
}

const splits = {
    "7": {
        "[BOSS] Storm: Pathetic Maxor, just like expected.": "&aPhase 1",
        "[BOSS] Goldor: Who dares trespass into my domain?": "&bPhase 2",
        "[BOSS] Necron: You went further than any human before, congratulations.": "&cPhase 3",
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
    if (!Dungeon.inDungeon || splitIndex == Object.keys(splits[Dungeon.floorInt]).length) return

    let formatted = ChatLib.getChatMessage(event)
    let unformatted = ChatLib.removeFormatting(formatted)
    if (unformatted == Object.keys(splits[Dungeon.floorInt])[splitIndex]) {
        splitMsg += `${splits[Dungeon.floorInt][Object.keys(splits[Dungeon.floorInt])[splitIndex]]}: ${getSecs(new Date().getTime() - lastSplit)}\n`
        splitIndex++
        lastSplit = new Date().getTime()
    }
    

})

register("renderOverlay", () => {
    if (!Config.runSplitsMoveGui.isOpen() && (!Config.runSplits || !Dungeon.inDungeon || !Dungeon.bossEntry)) return
    if (splitIndex == Object.keys(splits[Dungeon.floorInt]).length) {
        currentSplit = ""
    }
    else {
        currentSplit = `${splits[Dungeon.floorInt][Object.keys(splits[Dungeon.floorInt])[splitIndex]]}: ${getSecs(new Date().getTime() - lastSplit)}`
    }
    
    Renderer.drawString(`&6&lRun Splits\n` +
                        splitMsg +
                        currentSplit,
                        data.runSplits.x,
                        data.runSplits.y
    )
})

register("tick", () => {
    if (!lastSplit && Dungeon.bossEntry) {
        lastSplit = Dungeon.bossEntry
    }
})

register("dragged", (dx, dy, x, y) => {
    if (Config.runSplitsMoveGui.isOpen()) {
        data.runSplits.x = x
        data.runSplits.y = y
        data.save()
    }
})

register("worldLoad", () => reset())
