import Dungeon from "../../BloomCore/dungeons/Dungeon";
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

    let bloodOpened = !Dungeon.bloodOpened && Dungeon.runStarted ? getTime(new Date().getTime() - Dungeon.runStarted) : Dungeon.bloodOpened ? getTime(Dungeon.bloodOpened - Dungeon.runStarted) : "?"
    let watcherCleared = Dungeon.watcherCleared ? getSecs(Dungeon.watcherCleared - Dungeon.bloodOpened) : !Dungeon.watcherCleared && Dungeon.bloodOpened ? getSecs(new Date().getTime() - Dungeon.bloodOpened) : "?"
    let bossEntry = !Dungeon.bossEntry && Dungeon.runStarted ? "?" : getTime(Dungeon.bossEntry - Dungeon.runStarted)

    overviewStr = [
        `&6&lRun Overview`,
        `&8Wither Doors: &7${Dungeon.openedWitherDoors}`,
        `&4Blood Open: ${bloodOpened}`,
        `&cWatcher Clear: ${watcherCleared}`,
        `&aBoss Entry: ${bossEntry}`
    ].join("\n")
})

register("renderOverlay", () => {
    if (!overviewStr) return
    Renderer.drawString(overviewStr, data.runOverview.x, data.runOverview.y)
})
