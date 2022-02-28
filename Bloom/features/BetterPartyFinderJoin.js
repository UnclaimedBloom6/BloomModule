import Config from "../Config";
import { stripRank } from "../utils/Utils";

register("chat", (player, event) => {
    let formatted = ChatLib.getChatMessage(event, true)
    let match = formatted.match(/&dDungeon Finder &r&f> &r(.+) &r&ejoined the dungeon group! \(&r&b(.+) Level (\d+)&r&e\)&r/)
    let playerF = match[1]
    let classs = match[2]
    let level = match[3]
    if (Config.betterPFMessage) {
        cancel(event)
        let msg = new Message(new TextComponent(`&d&lPF > ${playerF} &8| &b${classs} ${level}`))
        if (player !== Player.getName()) {
            msg.addTextComponent(new TextComponent(" &8| &c[Kick]").setClick("run_command", `/p kick ${player}`).setHover("show_text", `&c/p kick ${player}`))
            msg.addTextComponent(new TextComponent(" &7[Ignore]").setClick("run_command", `/ignore add ${player}`).setHover("show_text", `&7/ignore add ${player}`))
            msg.addTextComponent(new TextComponent(" &d[PV]").setClick("run_command", `/pv ${player}`).setHover("show_text", `&d/pv ${player}`))
        }
        msg.chat()
    }
    if (Config.autoDS && stripRank(ChatLib.removeFormatting(player)) !== Player.getName()) {
        ChatLib.command(`ds ${stripRank(ChatLib.removeFormatting(player))}`, true)
    }
}).setCriteria("Dungeon Finder > ${player} joined the dungeon group! (${*} Level ${*})")