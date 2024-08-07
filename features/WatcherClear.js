import { registerWhen } from "../../BloomCore/utils/Utils";
import Dungeon from "../../BloomCore/dungeons/Dungeon";
import { getCurrentTime, startMeasuring, stopMeasuring } from "../utils/TimerMeasure";
import Config from "../Config";

let bloodStarted = 0;
let measuring = false;
let targetServerDuration = 22000;
let tickListener = null;
let countdownListener = null;

let dungeonMessages = [
    "[BOSS] The Watcher: Ah, you've finally arrived.", // F1/ M1
    "[BOSS] The Watcher: Ah, we meet again...", // F2/ M2
    "[BOSS] The Watcher: So you made it this far... interesting.", // F3/ M3
    "[BOSS] The Watcher: You've managed to scratch and claw your way here, eh?", // F4/ M4
    "[BOSS] The Watcher: This time I've imbued my minions with special properties!", // F5/ M5
    "[BOSS] The Watcher: You've arrived too early, I haven't even set up..", // F6/ M6
    "[BOSS] The Watcher: Things feel a little more roomy now, eh?" // F7/ M7
];

const displayCountdown = (seconds, callback) => {
    let remainingSeconds = seconds;
    let lastUpdateTime = Date.now();

    countdownListener = register("tick", () => {
        let currentTime = Date.now();
        let elapsedMilliseconds = currentTime - lastUpdateTime;

        if (elapsedMilliseconds >= 1000) {
            remainingSeconds -= 1;
            lastUpdateTime = currentTime;

            if (remainingSeconds > 0) {
                Client.showTitle("", `§a${remainingSeconds}`, 0, 20, 0);
            } else {
                Client.showTitle("", `§a0`, 0, 20, 0);
                callback();
                countdownListener.unregister();
            }
        }
    });
};

const showKillMobsMessage = () => {
    ChatLib.chat("§6Kill Mobs");
    Client.showTitle("", "§c§lKill Blood Mobs", 0, 30, 0);
    World.playSound("fireworks.twinkle", 100, 1);

    stopMeasuring();
};

const onBloodOpened = () => {
    if (!Config.watcherClear) return;

    ChatLib.chat("§cBlood Opened.");
    bloodStarted = Date.now();
    startMeasuring(targetServerDuration);
    measuring = true;

    tickListener = register("tick", () => {
        if (measuring) {
            let { tickCount } = getCurrentTime();
            let perceivedServerTime = (tickCount / 20) * 1000;

            if (perceivedServerTime >= targetServerDuration) {
                measuring = false;
                displayCountdown(3, showKillMobsMessage);
                tickListener.unregister();
            }
        }
    });
};

for (let i = 0; i < dungeonMessages.length; i++) {
    register("chat", onBloodOpened).setCriteria(dungeonMessages[i]);
}