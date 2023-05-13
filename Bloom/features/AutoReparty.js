import Party from "../../BloomCore/Party";
import Config from "../Config";

const bossDeadMessages = [
    /\[BOSS\] Bonzo: Alright, maybe I'm just weak after all\.\./,
    /\[BOSS\] Scarf: Whatever\.\.\./,
    /\[BOSS\] The Professor: What\?! My Guardian power is unbeatable!/,
    /                      ☠ Defeated Thorn in .+/,
    /\[BOSS\] .+ Livid: Impossible! How did you figure out which one I was\?!/,
    /\[BOSS\] Sadan: NOOOOOOOOO!!! THIS IS IMPOSSIBLE!!/,
    /\[BOSS\] Necron: All this, for nothing\.\.\./
]

bossDeadMessages.forEach(msg => {
    register("chat", () => {
        if (Party.leader !== Player.getName() || !Config.autoReparty) return
        // Players after the rp command won't be repartied
        ChatLib.command(`/rp ${Party.excludePlayers.join(" ")}`, true)
        Party.excludePlayers = []
    }).setCriteria(msg)
})