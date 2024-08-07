import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { onChatPacket } from "../../BloomCore/utils/Events";
import Config from "../Config";
import { prefix, data } from "../utils/Utils";

onChatPacket((player) => {
    if (!Config.crystalTimer || !Dungeon.inDungeon || player !== Player.getName()) return
    
    const timeTaken = Date.now() - Dungeon.bossEntry
    let msg = `${prefix} &aCrystal took &b${Math.round(timeTaken / 10) / 100}s`
    if (!data.crystalPB || timeTaken < data.crystalPB) {
        msg += " &d&l(PB)"
        data.crystalPB = timeTaken
        data.save()
    }
    new Message(new TextComponent(msg).setHover("show_text", `&aPersonal Best: &b${Math.round(data.crystalPB / 10)/100}s`)).chat()
}).setCriteria(/^(\w+) picked up an Energy Crystal!$/)