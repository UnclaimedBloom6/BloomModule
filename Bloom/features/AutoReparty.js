import Config from "../Config";
import Party from "../utils/Party";

register("chat", (event) => {
    if (Party.leader !== Player.getName() || !Config.autoReparty) return
    let formatted = ChatLib.getChatMessage(event, true)
    let bossDeadMessages = [
        /&r&c\[BOSS\] Bonzo&r&f: Alright, maybe I'm just weak after all\.\.&r/,
        /&r&c\[BOSS\] Scarf&r&f: Whatever\.\.\.&r/,
        /&r&c\[BOSS\] The Professor&r&f: What?! My Guardian power is unbeatable!&r/,
        /&r&r&r                      &r&c☠ &r&eDefeated &r&cThorn &r&ein &r.+&r/,
        /&r&c\[BOSS\] .+ Livid&r&f: Impossible! How did you figure out which one I was\?!&r/,
        /&r&c\[BOSS\] Sadan&r&f: NOOOOOOOOO!!! THIS IS IMPOSSIBLE!!&r/,
        /&r&4\[BOSS\] Necron&r&c: &r&cAll this, for nothing\.\.\.&r/
    ]
    bossDeadMessages.forEach(regex => {
        if (formatted.match(regex)) {
            ChatLib.command(`/rp ${Party.excludePlayers.join(" ")}`, true)
            Party.excludePlayers = []
        }
    })
})