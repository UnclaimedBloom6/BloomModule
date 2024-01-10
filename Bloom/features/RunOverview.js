import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { registerWhen } from "../../BloomCore/utils/Utils";
import Config from "../Config";
import { getTime, getSecs, data } from "../utils/Utils";

register("dragged", (dx, dy, x, y) => {
    if (!Config.runOverviewMoveGui.isOpen()) return
    data.runOverview.x = x
    data.runOverview.y = y
    data.save()
})

let overviewStr = null
register("tick", () => {
    if (!Config.runOverviewMoveGui.isOpen() && (!Config.runOverview || !Dungeon.inDungeon)) return overviewStr = null

    let bloodOpened = "?"
    let watcherCleared = "?"
    let portalTime = "?"
    let bossEntry = "?"
    
    // Blood Open
    if (!Dungeon.bloodOpened && Dungeon.runStarted) bloodOpened = getTime(Date.now() - Dungeon.runStarted)
    else if (Dungeon.bloodOpened) bloodOpened = getTime(Dungeon.bloodOpened - Dungeon.runStarted)

    // Watcher Clear
    if (Dungeon.watcherCleared) watcherCleared = getSecs(Dungeon.watcherCleared - Dungeon.bloodOpened)
    else if (!Dungeon.watcherCleared && Dungeon.bloodOpened) watcherCleared = getSecs(Date.now() - Dungeon.bloodOpened)

    // Portal Time
    if (Dungeon.watcherCleared && !Dungeon.bossEntry) portalTime = `${Math.floor((Date.now() - Dungeon.watcherCleared) / 10) / 100}s`
    if (Dungeon.bossEntry) portalTime = `${Math.floor((Dungeon.bossEntry - Dungeon.watcherCleared) / 10) / 100}s`

    // Boss Entry
    if (Dungeon.bossEntry || !Dungeon.runStarted) bossEntry = getTime(Dungeon.bossEntry - Dungeon.runStarted)

    overviewStr = [
        `&6&lRun Overview`,
        `&8Wither Doors: &7${Dungeon.openedWitherDoors}`,
        `&4Blood Open: ${bloodOpened}`,
        `&cWatcher Clear: ${watcherCleared}`,
        `&dPortal: ${portalTime}`,
        `&aBoss Entry: ${bossEntry}`
    ].join("\n")
})

registerWhen(register("renderOverlay", () => {
    if (!overviewStr) return
    Renderer.drawString(overviewStr, data.runOverview.x, data.runOverview.y)
}), () => overviewStr)
