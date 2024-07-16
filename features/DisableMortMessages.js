import Config from "../Config"

register("chat", (event) => {
    if (!Config.disableMortMessages) return
    cancel(event)
}).setCriteria(/^\[NPC\] Mort: .+$/)