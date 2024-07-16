import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { Terminal, data, prefix, terminalInvNames } from "../utils/Utils";
import Config from "../Config";
import { onChatPacket } from "../../BloomCore/utils/Events";

const terminalNames = new Map([
    [Terminal.COLORS, "colors"],
    [Terminal.MAZE, "maze"],
    [Terminal.MELODY, "melody"],
    [Terminal.NUMBERS, "numbers"],
    [Terminal.REDGREEN, "redgreen"],
    [Terminal.RUBIX, "rubix"],
    [Terminal.STARTSWITH, "startsWith"],
])

const displayNames = new Map([
    [Terminal.COLORS, "Colors"],
    [Terminal.MAZE, "Maze"],
    [Terminal.MELODY, "Melody"],
    [Terminal.NUMBERS, "Numbers"],
    [Terminal.REDGREEN, "Correct the Panes"],
    [Terminal.RUBIX, "Rubix"],
    [Terminal.STARTSWITH, "Starts With"],
])

let termEnter = null
let lastTerm = null
let wasInTerminal = false
register("step", () => {
    if (!Config.terminalTimer || !Dungeon.inDungeon || Dungeon.floorNumber !== 7 || !Dungeon.bossEntry) return

    const inv = Player.getContainer()
    if (!inv) return
    
    for (let e of Object.entries(terminalInvNames)) {
        let [k, v] = e
        if (!inv.getName().startsWith(k)) continue

        // Reset the time when new terminal is opened
        if (!wasInTerminal) termEnter = Date.now()
        wasInTerminal = true
        lastTerm = v

        return
    }

    // Not in a terminal
    wasInTerminal = false
})

onChatPacket((player) => {
    if (!termEnter || player !== Player.getName()) return

    const time = Date.now() - termEnter
    const seconds = Math.floor(time / 10) / 100
    const termName = terminalNames.get(lastTerm)
    let bestTime = data.terminalTimer[termName] ?? Infinity
    let extraString = ` &8Best: ${Math.floor(bestTime/10) / 100}s`

    if (time < bestTime) {
        extraString = " &d&l(PB)"
        data.terminalTimer[termName] = time
        data.save()
    }

    const final = `${prefix} &a${displayNames.get(lastTerm)} Terminal took &b${seconds}s&a${extraString}`
    new TextComponent(final).setClick("run_command", `/ct copy ${final.removeFormatting()}`).setHover("show_text", "&aClick to copy!").chat()
    
    termEnter = null
    lastTerm = null
}).setCriteria(/^(\w+) activated a terminal! \(\d\/\d\)$/)