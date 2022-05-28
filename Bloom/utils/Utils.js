import PogObject from "../../PogData/index"

export const prefix = "&8[&bBloom&8]&r"
export const data = new PogObject("Bloom", {
    "firstTime": true,
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

export const colorOrder = [1, 4, 13, 11, 14]

export const paneMetas = {
    1: "orange",
    4: "yellow",
    13: "green",
    11: "blue",
    14: "red"
}

export const getSecs = (ms) => !ms ? "0s" : Math.floor(ms/10)/100 + "s"
export const getTime = (ms) => !ms ? "?" : Math.floor(ms/60000) !== 0 ? `${Math.floor(ms/60000)}m ${Math.floor(ms/1000)%60}s` : `${Math.floor(ms/1000)%60}s`

export let chatIncrement = 3457

export const setEnchanted = (slot) => Player.getOpenedInventory()?.getStackInSlot(slot)?.itemStack?.func_77966_a(net.minecraft.enchantment.Enchantment.field_180314_l, 1)
export const setPaneToGreen = (slot) => Player.getOpenedInventory()?.getStackInSlot(slot)?.setDamage(5)
export const isEnchanted = (slot) => Player.getOpenedInventory()?.getStackInSlot(slot)?.isEnchanted()
export const clickSlot = (slot, windowId, btn) => Client.getMinecraft().field_71442_b.func_78753_a(windowId ? windowId : Player.getOpenedInventory().getWindowId(), slot, btn ? btn : 2, 3, Player.getPlayer())
