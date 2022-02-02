import Config from "../Config"
import Dungeon from "../utils/Dungeon"
import { prefix, setAir } from "../utils/Utils"

class ThreeWeirdosSolver {
    constructor() {
        this.solutions = [
            /^The reward is not in my chest!$/,
            /^At least one of them is lying, and the reward is not in \w+'s chest\.$/,
            /^My chest doesn't have the reward\. We are all telling the truth\.$/,
            /^My chest has the reward and I'm telling the truth!$/,
            /^The reward isn't in any of our chests\.$/,
            /^Both of them are telling the truth\. Also, \w+ has the reward in their chest\.$/,
        ]
        this.wrong = [
            /^One of us is telling the truth!$/,
            /^They are both telling the truth\. The reward isn't in \w+'s chest.$/,
            /^We are all telling the truth!$/,
            /^\w+ is telling the truth and the reward is in his chest.$/,
            /^My chest doesn't have the reward. At least one of the others is telling the truth!$/,
            /^One of the others is lying.$/,
            /^They are both telling the truth, the reward is in \w+'s chest.$/,
            /^They are both lying, the reward is in my chest!$/,
            /^The reward is in my chest.$/,
            /^The reward is not in my chest\. They are both lying.$/,
            /^\w+ is telling the truth.$/,
            /^My chest has the reward.$/
        ]

        register("chat", (event) => {
            // if (!Dungeon.inDungeon || !Config.weirdosSolver) return
            let message = ChatLib.getChatMessage(event).removeFormatting()
            let match = message.match(/\[NPC\] (\w+): (.+)/)
            if (!match) return
            for (let i = 0; i < this.solutions.length; i++) {
                if (this.solutions[i].test(match[2])) {
                    ChatLib.chat(`${prefix} &a${match[1]} has the blessing!`)
                }
            }
            for (let i = 0; i < this.wrong.length; i++) {
                if (this.wrong[i].test(match[2])) {
                    let alle = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand").class)
                    alle.forEach(e => {
                        if (e.getName().removeFormatting() == match[1]) {
                            let x = e.getX()
                            let y = e.getY()
                            let z = e.getZ()
                            setAir(x+1, y, z)
                            setAir(x-1, y, z)
                            setAir(x, y, z+1)
                            setAir(x, y, z-1)
                        }
                    })
                }
            }
        })
    }
}
export default new ThreeWeirdosSolver()