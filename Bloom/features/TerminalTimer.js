import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { Terminal, data, prefix, terminalInvNames } from "../utils/Utils";
import Config from "../Config";

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

// not using TerminalSolver as that only updates 20 times per second. This updates 60 times per second.
let termEnter = null
let currentTerm = null
register("step", () => {
    if (!Config.terminalTimer || !Dungeon.inDungeon || Dungeon.floorNumber !== 7 || !Dungeon.bossEntry) return

    const inv = Player.getContainer()
    if (!inv) return

    Object.entries(terminalInvNames).forEach(([k, v]) => {
        if (!inv.getName().startsWith(k)) return
        currentTerm = v

        if (termEnter) return
        termEnter = new Date().getTime()
    })
})

register("chat", (player) => {
    if (!termEnter || player !== Player.getName()) return

    const time = new Date().getTime() - termEnter
    const seconds = Math.floor(time / 10) / 100
    const termName = terminalNames.get(currentTerm)
    let bestTime = data.terminalTimer[termName] ?? Infinity
    let extraString = ` &8Best: ${Math.floor(bestTime/10) / 100}s`

    if (time < bestTime) {
        extraString = " &d&l(PB)"
        data.terminalTimer[termName] = time
        data.save()
    }

    const final = `${prefix} &a${displayNames.get(currentTerm)} Terminal took &b${seconds}s&a${extraString}`
    new TextComponent(final).setClick("run_command", `ct copy ${final.removeFormatting()}`).setHover("show_text", "&aClick to copy!").chat()
    
    termEnter = null
    currentTerm = null
}).setCriteria(/^(\w+) activated a terminal! \(\d\/\d\)$/)
