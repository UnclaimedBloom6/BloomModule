import PogObject from "../../PogData/index"
import request from "../../requestV2/index"
import { catacombs, cataSkills, maxLevels, normalSkill, runecrafting } from "./SkillsProgression"

const prefix = "&8[&bBloom&8]&r"
const BlockPoss = Java.type("net.minecraft.util.BlockPos")
const Blocks = Java.type("net.minecraft.init.Blocks")
const data = new PogObject("Bloom", {
    "apiKey": null,
    "speedDisplay": {
        "x": 0,
        "y": 0
    },
    "party": {
        "x": 0,
        "y": 0
    },
    "crystalPB": 0,
    "runSplits": {
        "x": 0,
        "y": 0
    },
    "runOverview": {
        "x": 0,
        "y": 0
    },
    "dungeonWarpCooldown": {
        "x": 0,
        "y": 0
    }
}, "data/data.json")

const fn = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

const getTabList = () => TabList.getNames().map(a => ChatLib.removeFormatting(a))

const setAir = (x, y, z) => World.getWorld().func_175698_g(new BlockPoss(x, y, z))

const title = (string) => {
    let split = string.split(" ")
    let final = ""
    for (let i = 0; i < split.length; i++) {
        let split2 = split[i].split("")
        split2[0] = split2[0].toUpperCase()
        final += split2.join("") + " "
    }
    return final.trim()
}

let hidePartyListDuration = null
let hidePartyListStart = null
const hidePartyStuff = (ms) => {
	hidePartyListStart = new Date().getTime()
	hidePartyListDuration = ms
}
register("chat", event => {
	let formatted = ChatLib.getChatMessage(event, true)
	let unformatted = ChatLib.removeFormatting(formatted)
	if (!hidePartyListStart || !hidePartyListDuration) { return }
	if (new Date().getTime() - hidePartyListStart < hidePartyListDuration && hidePartyListStart) {
		if (formatted == "&9&m-----------------------------&r") { cancel(event) }
		if (/Party Members|Leader|Moderators:.+/.test(unformatted)) { cancel(event) }
		if (/.+ &r&ehas disbanded the party!&r/.test(formatted)) { cancel(event) }
		if (/.+ &r&einvited &r.+ &r&eto the party! They have &r&c60 &r&eseconds to accept.&r/.test(formatted)) { cancel(event) }
	}
})
register("tick", () => {
	if (new Date().getTime() - hidePartyListStart > hidePartyListDuration && hidePartyListStart) {
		hidePartyListStart = null
		hidePartyListDuration = null
	}
})

const isBetween = (a, b, c) => (a - b) * (a - c) <= 0
const stripRank = (rankedPlayer) => rankedPlayer.replace(/\[[\w+\+-]+] /, "")

const getMojangInfo = (player) => player.length > 16 ? request(`https://sessionserver.mojang.com/session/minecraft/profile/${player}`) : request(`https://api.mojang.com/users/profiles/minecraft/${player}`)
const getHypixelPlayer = (uuid) => request(`https://api.hypixel.net/player?key=${data.apiKey}&uuid=${uuid}`)
const getSbProfiles = (uuid) => request(`https://api.hypixel.net/skyblock/profiles?key=${data.apiKey}&uuid=${uuid}`)
const getSlothPixelPlayer = (player) => request(`https://api.slothpixel.me/api/players/${player}`)
const getGuildInfo = (player) => request(`https://api.slothpixel.me/api/guilds/${player}`)

const getRecentProfile = (profiles, uuid) => {
    if (!profiles["profiles"]) return null
    let lastProfile = []
    for (let profile in profiles["profiles"]) {
        let currLastSave = profiles["profiles"][profile]["members"][uuid]["last_save"]
        if (currLastSave) {
            if (!lastProfile[0]) {
                lastProfile = [currLastSave, profile]
            }
            else {
                if (currLastSave > lastProfile[0]) {
                    lastProfile = [currLastSave, profile]
                }
            }
        }
    }
    return profiles["profiles"][lastProfile[1]]
}
const getSecs = (ms) => !ms ? "0s" : Math.floor(ms/10)/100 + "s"
const getTime = (ms) => !ms ? "?" : Math.floor(ms/60000) !== 0 ? `${Math.floor(ms/60000)}m ${Math.floor(ms/1000)%60}s` : `${Math.floor(ms/1000)%60}s`

const calcSkillLevel = (skill, xp) => {
    if (!xp || !skill) return 0
    let level = 0
    let progression = normalSkill
    let maxLevel = 50

    const getLevel = () => {
        if (xp > progression[maxLevel]) return maxLevel
        
        for (let i = 0; i < progression.length; i++) {
            if (progression[i] >= xp) {
                level = i - 1
                break
            }
        }
        return Math.round((level + (xp - progression[level]) / (progression[level + 1] - progression[level])) * 100) / 100
    }

    if (Object.keys(maxLevels).includes(skill)) {
        maxLevel = maxLevels[skill]
        return getLevel()
    }
    else if (cataSkills.includes(skill)) {
        progression = catacombs
        return getLevel()
    }
    else if (skill == "runecrafting") {
        progression = runecrafting
        maxLevel = 25
    }
}

const getDistance = (x1, y1, z1, x2, y2, z2) => Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2)

const removeUnicode = (text) => text.replace(/[^\u0000-\u007F]/g, "")
const colors = {
	"BLACK": "&0",
	"DARK_BLUE": "&1",
	"DARK_GREEN": "&2",
	"DARK_AQUA": "&3",
	"DARK_RED": "&4",
	"DARK_PURPLE": "&5",
	"GOLD": "&6",
	"GRAY": "&7",
	"DARK_GRAY": "&8",
	"BLUE": "&9",
	"GREEN": "&a",
	"AQUA": "&b",
	"RED": "&c",
	"LIGHT_PURPLE": "&d",
	"YELLOW": "&e",
	"WHITE": "&f"
}
const getRank = (playerInfo) => {
	// Gets the player's rank via the Hypixel player API method json
	let rankFormats = {
		"VIP": "&a[VIP]",
		"VIP_PLUS": "&a[VIP&6+&a]",
		"MVP": "&b[MVP]",
		"MVP_PLUS": "&b[MVP&c+&b]",
		"ADMIN": "&c[ADMIN]",
		"MODERATOR": "&2[MOD]",
		"HELPER": "&9[HELPER]",
		"YOUTUBER": "&c[&fYOUTUBE&c]"
	}
	let specialRanks = {
		"Technoblade": "&d[PIG&b+++&d]"
	}
	let username = playerInfo["player"]["displayname"]
	if (username in specialRanks) {
		return specialRanks[username]
	}
	if ("rank" in playerInfo["player"] && playerInfo["player"]["rank"] in rankFormats) { return rankFormats[playerInfo["player"]["rank"]] }
	let currRank = "&7"
	if ("newPackageRank" in playerInfo["player"]) {
		currRank = rankFormats[playerInfo["player"]["newPackageRank"]]
	}
	if ("monthlyPackageRank" in playerInfo["player"] && playerInfo["player"]["monthlyPackageRank"] == "SUPERSTAR") {
		currRank = "&6[MVP&c++&6]"
		if ("monthlyRankColor" in playerInfo["player"]) {
			currRank = currRank.replace("&b", colors[playerInfo["player"]["monthlyRankColor"]])
		}
	}
	if ("rankPlusColor" in playerInfo["player"]) {
		currRank = currRank.replace(/\+/g, `${colors[playerInfo['player']['rankPlusColor']]}+`)
	}
	return currRank
}
let chatIncrement = 3457

function toTime(timeStamp) {
	if (!timeStamp) return `??:??`
	let minutes = parseInt(timeStamp / 1000 / 60)
	let seconds = parseInt((timeStamp - (minutes * 1000 * 60)) / 1000)
	if (seconds.toString().length == 1) seconds = "0" + seconds
	if (isNaN(minutes) || isNaN(seconds)) return(`??:??`)
	return(`${minutes ? minutes+":" : ""}${seconds}`)
}
const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const partyPlayers = ([players]) => {
    if (!players || !players.length) return
    ChatLib.command(`p ${players[0]}`)
    if (players.length == 1) return
    setTimeout(() => {
        ChatLib.command(`p ${players.splice(1).join(" ")}`)
    }, 500);
}

export {
    prefix,
    BlockPoss,
    Blocks,
    data,
    getTabList,
    setAir,
    fn,
    title,
    isBetween,
    stripRank,
    getMojangInfo,
    getHypixelPlayer,
    getSbProfiles,
    getSlothPixelPlayer,
    getGuildInfo,
    getRecentProfile,
    hidePartyStuff,
    getSecs,
    getTime,
    calcSkillLevel,
    getDistance,
    removeUnicode,
    colors,
    getRank,
    chatIncrement,
    toTime,
    monthsShort,
    partyPlayers
}