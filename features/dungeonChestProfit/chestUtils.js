import PriceUtils from "../../../BloomCore/PriceUtils"
import { fn, getSkyblockItemID } from "../../../BloomCore/utils/Utils"

export const chestData = {
    "Wood": {
        texture: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMWFlMzg1NWY5NTJjZDRhMDNjMTQ4YTk0NmUzZjgxMmE1OTU1YWQzNWNiY2I1MjYyN2VhNGFjZDQ3ZDMwODEifX19",
        color: "&f"
    },
    "Gold": {
        texture: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNGFkMDQ3NmU4NjcxNjk2YWYzYTg5NDlhZmEyYTgxNGI5YmRkZTY1ZWNjZDFhOGI1OTNhZWVmZjVhMDMxOGQifX19",
        color: "&6"
    },
    "Diamond": {
        texture: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNzdiOWRmZDI4MWRlYWVmMjYyOGFkNTg0MGQ0NWJjZGE0MzZkNjYyNjg0NzU4N2YzYWM3NjQ5OGE1MWM4NjEifX19",
        color: "&b"
    },
    "Emerald": {
        texture: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTBlZDk0YmY1ZmNjZGQ5ZDNiN2NhN2ZhMzhlMmNlYjUwMTMzMmU2YjMzNTM0MDQyNzY1NjZiNTIxNmMxMzA0ZiJ9fX0K",
        color: "&2"
    },
    "Obsidian": {
        texture: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvODkzM2VlZmFiOGZjYjNmYTBmNDdiYjAzOTlhNTA4ZWY2YzkxMWRhZTRiMTE0NTU3ZjkwNjg5N2FlY2VkZjg1YSJ9fX0K",
        color: "&5"
    },
    "Bedrock": {
        texture: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNzRhYzY0NjMzMjQ5ZjEzZjFiMGM5NTI1YzZlZmE0NGNkZTk2YWJjZDY0N2UwOTVhMTcxZmUyNDRjMWEyNDRlNSJ9fX0K",
        color: "&8"
    }
}

export class DungeonChest {
    constructor(chestName) {
        this.name = chestName
        this.items = []
        this.value = 0
        this.cost = 0
        this.profit = 0
    }
    getChestProfitStr() {
        let color = this.profit > 0 ? "&a+" : "&c"
        return `${this.getFormattedName()} &6(${fn(this.cost)})&f: ${color}${fn(this.profit)}`
    }
    getChestStr() {
        let str = this.items.reduce((a, b) => a + `  ${b.getPriceStr()}\n`, "")
        return `${this.getChestProfitStr()}\n${str}`
    }
    getFormattedName() {
        return `${chestData[this.name]?.color}&l${this.name} Chest&r`
    }
    calcValueAndProfit() {
        this.value = this.items.reduce((a, b) => a + b.value, 0)
        this.profit = Math.floor(this.value - this.cost)
    }
}

export class ChestItem {
    /**
     * 
     * @param {Item} item 
     */
    constructor(item) {
        this.item = item
        this.name = item.getName()
        this.quantity = 1
        this.init()
    }
    init() {
        const name = this.item.getName().removeFormatting()
        const match = name.match(/^(\w+) Essence x(\d+)$/)
        this.itemID = getSkyblockItemID(this.item)
        if (match) {
            let [_, type, amt] = match
            this.itemID = `ESSENCE_${type}`.toUpperCase()
            this.quantity = parseInt(amt)
        }
        if (this.itemID.startsWith("ENCHANTMENT")) {
            let lore = this.item.getLore()
            if (lore.length < 2) return
            this.name = lore[1]
        }

        this.calcValue()
    }
    calcValue() {
        if (worthless.has(this.itemID)) {
            this.value = 0
            return 0
        }
        
        const sellInfo = PriceUtils.getSellPrice(this.itemID, true)
        if (!sellInfo) return 0
        const [price, from] = sellInfo
        
        this.value = price * this.quantity
        
        if (this.item.getRegistryName() == "minecraft:enchanted_book") {
            this.value = PriceUtils.getBookPriceWhenCrafted(this.item)
        }

        // Tax shit
        if (from == PriceUtils.locations.AUCTION) this.value = PriceUtils.getBINPriceAfterTax(this.value)
        else this.value *= (1 - 0.0125)


        return Math.floor(this.value)
    }
    getPriceStr() {
        let color = "&a+"
        if (this.value == 0) color = "&e"
        if (this.value < 0) color = "&c-"

        return `${this.name}&f: ${color}${fn(Math.floor(this.value))}`
    }
    toString() {
        return `ChestItem[${this.itemID}, qty=${this.quantity}, value=${this.value}]`
    }
}

export const alwaysBuy = new Set([
    "NECRON_HANDLE",
    "DARK_CLAYMORE",
    "FIRST_MASTER_STAR",
    "SECOND_MASTER_STAR",
    "THIRD_MASTER_STAR",
    "FOURTH_MASTER_STAR",
    "FIFTH_MASTER_STAR",
    "SHADOW_FURY",
    "SHADOW_WARP_SCROLL",
    "IMPLOSION_SCROLL",
    "WITHER_SHIELD_SCROLL",
    "ENCHANTMENT_ULTIMATE_ONE_FOR_ALL_1"
])

export const worthless = new Set([
    "DUNGEON_DISC_5",
    "MAXOR_THE_FISH",
    "STORM_THE_FISH",
    "GOLDOR_THE_FISH",
])