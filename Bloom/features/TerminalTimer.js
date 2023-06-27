import { data, prefix } from "../utils/Utils";
import Config from "../Config";
import TerminalSolver from "./TerminalSolver";

register("chat", (player) => {
    if (!TerminalSolver.lastTerminal || player !== Player.getName() || !Config.terminalTimer) return

    const time = new Date().getTime() - TerminalSolver.lastTerminal.createdAt
    const seconds = Math.floor(time / 10) / 100
    const saveName = TerminalSolver.lastTerminal.saveName
    let bestTime = data.terminalTimer[saveName] ?? Infinity
    let extraString = ` &8Best: ${Math.floor(bestTime/10) / 100}s`

    if (time < bestTime) {
        extraString = " &d&l(PB)"
        data.terminalTimer[saveName] = time
        data.save()
    }

    const final = `${prefix} &a${TerminalSolver.lastTerminal.name} Terminal took &b${seconds}s&a${extraString}`
    new TextComponent(final).setClick("run_command", `/ct copy ${final.removeFormatting()}`).setHover("show_text", "&aClick to copy!").chat()
}).setCriteria(/^(\w+) activated a terminal! \(\d\/\d\)$/)
