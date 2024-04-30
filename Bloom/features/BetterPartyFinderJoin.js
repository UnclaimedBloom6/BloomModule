import { stripRank } from "../../BloomCore/utils/Utils";
import Config from "../Config";

register("chat", (player, event) => {
    let formatted = ChatLib.getChatMessage(event, true)
    let match = formatted.match(/&dParty Finder &r&f> &r(.+) &r&ejoined the dungeon group! \(&r&b(.+) Level (\d+)&r&e\)&r/)
    let [msg, playerF, classs, level] = match
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
}).setCriteria("Party Finder > ${player} joined the dungeon group! (${*} Level ${*})")

const messageReplacements = {
    "Party Finder > Your party has been queued in the dungeon finder!": "&d&lPF > &aParty Queued.",
    "Party Finder > Your group has been de-listed!": "&d&lPF > &aParty Delisted.."
}

register("chat", (message, event) => {
    if (!Config.betterPFMessage) return
    if (Object.keys(messageReplacements).some(a => a == message)) {
        cancel(event)
        ChatLib.chat(messageReplacements[message])
    }
}).setCriteria("${message}")

register("chat", (player, clazz, level, e) => {
    if (!Config.betterPFMessage) return
    player = ChatLib.getChatMessage(e).split(" ")[3] // &dParty Finder &r&f> &r&ak1deuk &r&eset their class to &r&bBerserk Level 30&r&e!&r
    cancel(e)
    ChatLib.chat(`&d&lPF > &r${player} &echanged to &b${clazz} ${level}&e!`)
}).setCriteria("Party Finder > ${player} set their class to ${clazz} Level ${level}!")
