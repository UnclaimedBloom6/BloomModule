import Dungeon from "../../BloomCore/Dungeons/Dungeon";
import Config from "../Config";
import { getTime, getSecs, data } from "../utils/Utils";

register("dragged", (dx, dy, x, y) => {
    if (!Config.runOverviewMoveGui.isOpen()) return
    data.runOverview.x = x
    data.runOverview.y = y
    data.save()
})

let maxWidth = 0

register("renderOverlay", () => {
    if (!Config.runOverviewMoveGui.isOpen() && (!Config.runOverview || !Dungeon.inDungeon)) return

    let bloodOpened = !Dungeon.bloodOpened && Dungeon.runStarted ? getTime(new Date().getTime() - Dungeon.runStarted) : Dungeon.bloodOpened ? getTime(Dungeon.bloodOpened - Dungeon.runStarted) : "?"
    let watcherCleared = Dungeon.watcherCleared ? getSecs(Dungeon.watcherCleared - Dungeon.bloodOpened) : !Dungeon.watcherCleared && Dungeon.bloodOpened ? getSecs(new Date().getTime() - Dungeon.bloodOpened) : "?"
    let bossEntry = !Dungeon.bossEntry && Dungeon.runStarted ? "?" : getTime(Dungeon.bossEntry - Dungeon.runStarted)
    // Renderer.drawString(`runStarted: ${Dungeon.runStarted}\nbloodOpen: ${Dungeon.bloodOpened}\nwatcherDone: ${Dungeon.watcherCleared}\nbossEntry: ${Dungeon.bossEntry}\nrunEnded: ${Dungeon.runEnded}`, 500, 200)

    let msg = [
        `&6&lRun Overview`,
        `&8Wither Doors: &7${Dungeon.openedWitherDoors}`,
        `&4Blood Open: ${bloodOpened}`,
        `&cWatcher Clear: ${watcherCleared}`,
        `&aBoss Entry: ${bossEntry}`
    ]
    // let width = msg.map(a => Renderer.getStringWidth(a)).sort((a, b) => b-a)[0]
    // if (width > maxWidth) maxWidth = width
    Renderer.translate(data.runOverview.x, data.runOverview.y)
    // Renderer.retainTransforms(true)
    // let l = msg.length
    // Renderer.drawRect(Renderer.color(0, 0, 0, 179), 0, 0, maxWidth+1, 7*l + (l-1)*2 + 2)
    Renderer.drawString(msg.join("\n"), 0, 0)
    // Renderer.retainTransforms(false)
})
