import { stripRank } from "../../BloomCore/utils/Utils";
import Config from "../Config";

register("chat", (p1, p2) => {
    if (stripRank(p1) == Player.getName() && Config.autoTransfer) ChatLib.command(`p transfer ${stripRank(p2)}`)
}).setChatCriteria("The party was transferred to ${p1} by ${p2}")

register("chat", (p1, p2) => {
    if (stripRank(p2) == Player.getName() && Config.autoTransfer) ChatLib.command(`p promote ${stripRank(p1)}`)
}).setChatCriteria("${p1} has promoted ${p2} to Party Leader")