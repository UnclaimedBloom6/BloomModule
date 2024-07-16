import Party from "../../BloomCore/Party"
import { hidePartySpam, partyPlayers } from "../../BloomCore/utils/Utils"
import { prefix } from "../utils/Utils"

let lastReparty
export const repartyCommand = register("command", ...args => {
	new Thread(() => {
        args = !args ? [] : args
        hidePartySpam(3000)
        ChatLib.command("pl")
        Thread.sleep(500)
        if (Object.keys(!Party.members).length) return ChatLib.chat(`${prefix} &cYou are not in a party!`)
        else if (Party.leader !== Player.getName()) return ChatLib.chat(`${prefix} &cYou are not this party's leader!`)
        let toRp = Object.keys(Party.members).filter(a => a !== Player.getName() && !args.join(" ").toLowerCase().includes(a.toLowerCase()))
        let rpMsg = new Message(`${prefix} &aRepartying `)
        toRp.map(a => rpMsg.addTextComponent(new TextComponent(a == toRp[toRp.length-1] ? `${Party.members[a]}` : `${Party.members[a]}&a, `).setHover("show_text", "&aClick to invite!").setClick("run_command", `/p ${a}`)))
        rpMsg.addTextComponent("&a!").addTextComponent(new TextComponent(` &d[Retry]`).setHover("show_text", "&dParty players again").setClick("run_command", `/partyplayers ${toRp.join(" ")}`)).chat()
        ChatLib.command("p disband")
        Thread.sleep(500)
        partyPlayers([toRp])
    }).start()
}).setName("/rp")

register("command", (...players) => {
    ChatLib.chat(`${prefix} &aPartying players!`)
    hidePartySpam(2000)
    partyPlayers([players])
}).setName("partyplayers")

register("chat", event => {
	if (Date.now() - lastReparty > 2000 || lastReparty == undefined) return
	let formatted = ChatLib.getChatMessage(event, true)
	if (/&9&m-----------------------------&r/.test(formatted)) cancel(event)
	if (/.+ &r&ehas disbanded the party!&r/.test(formatted)) cancel(event)
	if (/.+ &r&einvited &r.+ &r&eto the party! They have &r&c60 &r&eseconds to accept.&r/.test(formatted)) cancel(event)
}).setCriteria("${*}")
