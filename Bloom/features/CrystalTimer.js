import Dungeon from "../../BloomCore/dungeons/Dungeon";
import Config from "../Config";
import { prefix, data } from "../utils/Utils";

register("chat", (player) => {
    if (!Config.crystalTimer || !Dungeon.inDungeon || player !== Player.getName()) return
    let timeTaken = new Date().getTime() - Dungeon.bossEntry
    let msg = `${prefix} &aCrystal took &b${Math.round(timeTaken / 10) / 100}s`
    if (!data.crystalPB || timeTaken < data.crystalPB) {
        msg += " &d&l(PB)"
        data.crystalPB = timeTaken
        data.save()
    }
    new Message(new TextComponent(msg).setHover("show_text", `&aPersonal Best: &b${Math.round(data.crystalPB / 10)/100}s`)).chat()
}).setCriteria("${player} picked up an Energy Crystal!")