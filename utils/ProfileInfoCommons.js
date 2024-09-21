// This file contains helper functions to parse a player's profile information to be used in /ds and //kuudra
import { fn, title } from "../../BloomCore/utils/Utils"

export const classWithSymbols = {
    "mage": "⚚ Mage",
    "healer": "☤ Healer",
    "archer": "➶ Archer",
    "tank": "። Tank",
    "berserk": "⚔ Berserk"
}

export function getMpInfo(sbProfile) {
    let mp = -1
    let mpHover = ""
    let abStorage = sbProfile.accessory_bag_storage

    if (!abStorage) return { mp, mpHover }

    mp = abStorage.highest_magical_power || null
    let selectedPower = abStorage.selected_power || null
    let tunings = abStorage.tuning?.slot_0 || null

    selectedPower = selectedPower ? (selectedPower.charAt(0).toUpperCase() + selectedPower.slice(1)).replace(/_/g," ") : "NONE"
    mpHover = `&cMagical Power: &e${fn(mp)}\n&cSelected Power: &e${selectedPower}\n&cTuning points: `
    let temp = false
    if (tunings) {
        for (let statname in tunings) {
            if (tunings[statname] == 0) continue

            if (temp) mpHover += ", "
            mpHover += "&f" + String(tunings[statname]) + " &7" + (statname.charAt(0).toUpperCase() + statname.slice(1)).replaceAll("_"," ")
            temp = true
        }
    }

    return { mp, mpHover }
}

const spiritSymbol = "⩀"
export function getSpiritPetStatus(sbProfile) {
    if (sbProfile.pets_data?.pets?.some(a => a.type == "SPIRIT" && a.tier == "LEGENDARY")) {
		return { spirit: true,spiritText: "&a" + spiritSymbol }
	}

    return { spirit: false,spiritText: "&c" + spiritSymbol + " &0&lNO SPIRIT" }
}

const gdragSymbol = "GDRAG"
export function getGdragStatus(sbProfile) {
    const gdrags = sbProfile.pets_data?.pets?.filter(a => a.type == "GOLDEN_DRAGON")
    if (!gdrags || !gdrags.length) return {gdragText: "&cNO" + gdragSymbol,gdragHover: "&eNo Golden Dragon Pet"}
    let missingBalance = false
    const bank = sbProfile.banking
    if (bank && bank.balance < 990_000_000) missingBalance = true


    let hasLevel200 = false
    let shelmetGdrag = false
    let remediesGdrag = false
    let relicGdrag = false
    for(let g of gdrags) {
        if (g.exp > 210_255_385) hasLevel200 = true
        if (g.heldItem === "DWARF_TURTLE_SHELMET") shelmetGdrag = true
        if (g.heldItem === "ANTIQUE_REMEDIES") remediesGdrag = true
        if (g.heldItem === "MINOS_RELIC") relicGdrag = true
    }

    if (missingBalance) {
        return {
            gdragText: "&4" + (gdrags.length > 1 ? (gdrags.length+" ") : "") + gdragSymbol,
            gdragHover: `&e${gdrags.length} Golden Dragon Pets&r` + 
                `&cOnly ${fn(Math.floor(bank.balance))} in bank${!hasLevel200 ? "\n\n&cNo Level 200" : ""}`
            }
    }

    return {
        gdragText: (hasLevel200 ? "&a" : "&4") + (gdrags.length > 1 ? (gdrags.length+" ") : "") + gdragSymbol,
        gdragHover: `&e${gdrags.length} Golden Dragon Pets&r\n` + 
            `${shelmetGdrag ? "&a" : "&c"}Dwarf Turtle Shelmet\n` + 
            `${remediesGdrag ? "&a" : "&c"}Antique Remedies\n` + 
            `${relicGdrag ? "&a" : "&c"}Minos Relic${!hasLevel200 ? "\n\n&cNo Level 200" : ""}`
    }
}

const arrowSymbol = "↣"
export function getSelectedArrows(sbProfile) {
    let arrow = sbProfile.item_data?.favorite_arrow
    const arrowMatch = arrow?.match(/^(.+?)_ARROW$/)

    if (!arrowMatch) return "&c" + arrowSymbol + " No Arrow Selected"
    const [_, arrowType] = arrowMatch

    return "&c" + arrowSymbol + " &e" + title(arrowType.replace(/_/g, " "))
}

export function getSbLevelInfo(sbProfile) {
    let level = sbProfile.leveling?.experience
    if (!level) level = 0
    level = Math.floor(level/100)
    level = `&f&l[${getLevelColor(level)}${level}&r&f]`
    return level
}


function getLevelColor(level) {
	if (level < 80) return "&f"
	if (level < 160) return "&a"
	if (level < 200) return "&2"
	if (level < 240) return "&b"
	if (level < 280) return "&3"
	if (level < 320) return "&9"
	if (level < 360) return "&d"
	if (level < 400) return "&5"
	if (level < 440) return "&6"
	if (level < 120) return "&e"
	if (level < 480) return "&c"
	return "&4"
}

