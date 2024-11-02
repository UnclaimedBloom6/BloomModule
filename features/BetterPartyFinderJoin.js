import Config from "../Config";

register("chat", (playerFormatted, clazz, level, event) => {
    const player = playerFormatted.removeFormatting()

    if (Config.autoDS && player !== Player.getName()) {
        ChatLib.command(`ds ${player}`, true)
    }

    if (!Config.betterPFMessage) return

    cancel(event)
    const msg = new Message(new TextComponent(`&d&lPF > ${playerFormatted} &8| &b${clazz} ${level}`))
    if (player !== Player.getName()) {
        msg.addTextComponent(new TextComponent(" &8| &c[Kick]").setClick("run_command", `/p kick ${player}`).setHover("show_text", `&c/p kick ${player}`))
        msg.addTextComponent(new TextComponent(" &7[Block]").setClick("run_command", `/block add ${player}`).setHover("show_text", `&7/block add ${player}`))
        msg.addTextComponent(new TextComponent(" &d[PV]").setClick("run_command", `/pv ${player}`).setHover("show_text", `&d/pv ${player}`))
    }
    msg.chat()
    
}).setCriteria(/^&dParty Finder &r&f> (.+?) &r&ejoined the dungeon group! \(&r&b(\w+) Level (\d+)&r&e\)&r$/)
// https://regex101.com/r/kSfhrU/1


const messageReplacements = {
    "Party Finder > Your party has been queued in the dungeon finder!": "&d&lPF > &aParty Queued.",
    "Party Finder > Your group has been de-listed!": "&d&lPF > &aParty Delisted.."
}

Object.entries(messageReplacements).forEach(([k, v]) => {
    register("chat", (event) => {
        if (!Config.betterPFMessage) return

        cancel(event)
        ChatLib.chat(v)
    }).setCriteria(k)
})

register("chat", (player, clazz, level, e) => {
    if (!Config.betterPFMessage) return

    cancel(e)
    ChatLib.chat(`&d&lPF > &r${player} &echanged to &b${clazz} ${level}&e!`)
}).setCriteria(/^&dParty Finder &r&f> (.+?) &r&eset their class to &r&b(\w+) Level (\d+)&r&e!&r$/)
// https://regex101.com/r/cbkQoq/1