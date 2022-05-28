import Dungeon from "../../BloomCore/Dungeons/Dungeon";
import Config from "../Config";
import { data, getSecs } from "../utils/Utils";

let lastSplit = null
let splitIndex = 0
let splitMsg = ""
let currentSplit = ""
let splitFloor = "F7"

const reset = () => {
    lastSplit = null
    splitIndex = 0
    splitMsg = ""
    currentSplit = ""
}

const splits = {
    "F7": {
        "[BOSS] Storm: Pathetic Maxor, just like expected.": "&aMaxor",
        "[BOSS] Goldor: Who dares trespass into my domain?": "&bStorm",
        "[BOSS] Goldor: You have done it, you destroyed the factory…": "&eTerminals",
        "[BOSS] Necron: You went further than any human before, congratulations.": "&7Goldor",
        "                             > EXTRA STATS <": "&4Necron",
    },
    "M7": {
        "[BOSS] Storm: Pathetic Maxor, just like expected.": "&aMaxor",
        "[BOSS] Goldor: Who dares trespass into my domain?": "&bStorm",
        "[BOSS] Goldor: You have done it, you destroyed the factory…": "&eTerminals",
        "[BOSS] Necron: You went further than any human before, congratulations.": "&7Goldor",
        "[BOSS] Necron: All this, for nothing...": "&cNecron",
        "                             > EXTRA STATS <": "&4Wither King",
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
    if (!Dungeon.inDungeon || !splitFloor || splitIndex == Object.keys(splits[splitFloor]).length) return

    let formatted = ChatLib.getChatMessage(event)
    let unformatted = ChatLib.removeFormatting(formatted)
    if (unformatted == Object.keys(splits[splitFloor])[splitIndex]) {
        splitMsg += `${splits[splitFloor][Object.keys(splits[splitFloor])[splitIndex]]}: ${getSecs(new Date().getTime() - lastSplit)}\n`
        splitIndex++
        lastSplit = new Date().getTime()
    }
})

register("renderOverlay", () => {
    if (!Config.runSplitsMoveGui.isOpen() && (!Config.runSplits || !Dungeon.inDungeon || !Dungeon.bossEntry)) return
    if (splitIndex == Object.keys(splits[splitFloor]).length) {
        currentSplit = ""
    }
    else {
        currentSplit = `${splits[splitFloor][Object.keys(splits[splitFloor])[splitIndex]]}: ${getSecs(new Date().getTime() - lastSplit)}`
    }
    
    Renderer.drawString(`&6&lRun Splits\n` +
                        splitMsg +
                        currentSplit,
                        data.runSplits.x,
                        data.runSplits.y
    )
})

register("tick", () => {
    if (Dungeon.floor == "M7") splitFloor = "M7"
    else if (Dungeon.floor == "F7") splitFloor = "F7"
    else splitFloor = Dungeon.floorNumber

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
