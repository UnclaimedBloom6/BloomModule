import Dungeon from "../utils/Dungeon";
import Config from "../Config";
import { getTime, getSecs, data } from "../utils/Utils";

class RunOverview {
    constructor() {
        

        register("renderOverlay", () => {
            if (!Config.runOverviewMoveGui.isOpen() && (!Config.runOverview || !Dungeon.inDungeon)) return
            this.render()
        })

        register("dragged", (dx, dy, x, y) => {
            if (Config.runOverviewMoveGui.isOpen()) {
                data.runOverview.x = x
                data.runOverview.y = y
                data.save()
            }
        })
    }
    render() {
        let bloodOpen = !Dungeon.bloodOpen && Dungeon.runStarted ? getTime(new Date().getTime() - Dungeon.runStarted) : Dungeon.bloodOpen ? getTime(Dungeon.bloodOpen - Dungeon.runStarted) : "?"
        let watcherDone = Dungeon.watcherDone ? getSecs(Dungeon.watcherDone - Dungeon.bloodOpen) : !Dungeon.watcherDone && Dungeon.bloodOpen ? getSecs(new Date().getTime() - Dungeon.bloodOpen) : "?"
        let bossEntry = !Dungeon.bossEntry && Dungeon.runStarted ? "?" : getTime(Dungeon.bossEntry - Dungeon.runStarted)
        // Renderer.drawString(`runStarted: ${Dungeon.runStarted}\nbloodOpen: ${Dungeon.bloodOpen}\nwatcherDone: ${Dungeon.watcherDone}\nbossEntry: ${Dungeon.bossEntry}\nrunEnded: ${Dungeon.runEnded}`, 500, 200)

        Renderer.drawString(`&6&lRun Overview\n` +
                            `&8Wither Doors: &7${Dungeon.openedWitherDoors}\n` +
                            `&4Blood Open: ${bloodOpen}\n` +
                            `&cWatcher Clear: ${watcherDone}\n` +
                            `&aBoss Entry: ${bossEntry}`,
                            data.runOverview.x,
                            data.runOverview.y
        )
    }
}
export default new RunOverview()