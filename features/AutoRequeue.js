import Dungeon from "../../BloomCore/dungeons/Dungeon"
import PartyV2 from "../../BloomCore/PartyV2"
import Config from "../Config"

const endTrigger = register("chat", () => {
    if (PartyV2.leader !== Player.getName()) {
        return
    }

    ChatLib.command(`instancerequeue`)
}).setCriteria(/^\s*> EXTRA STATS <$/).unregister()

Dungeon.onDungeonChange((inDungeon) => {
    if (!inDungeon || !Config.autoRequeue) {
        endTrigger.unregister()
        dtChecker.unregister()
        return
    }

    endTrigger.register()
    dtChecker.register()
})

const dtChecker = register("chat", (rank, name, message) => {
    if (!message.startsWith("!dt")) {
        return
    }

    ChatLib.chat(`${PartyV2.getFormattedName(name)} &eneeds downtime. AutoRequeue is disabled.`)

    endTrigger.unregister()
}).setCriteria(/^&r&9Party &8> ((?:&.(?:\[[^\]]+\])?)) *(\w+)&f: &r(.+)&r$/)

register("command", () => {
    ChatLib.chat(`&cAuto Requeue disabled for this run.`)
    
    endTrigger.unregister()
    dtChecker.unregister()
}).setName("/dt")

PartyV2.onPlayerLeft(() => {
    endTrigger.unregister()
    dtChecker.unregister()
})

PartyV2.onPartyDisband(() => {
    endTrigger.unregister()
    dtChecker.unregister()
})

Config.registerListener("Auto Requeue", (newState) => {
    if (newState && Dungeon.inDungeon) {
        endTrigger.register()
        dtChecker.register()
        return
    }

    endTrigger.unregister()
    dtChecker.unregister()
})