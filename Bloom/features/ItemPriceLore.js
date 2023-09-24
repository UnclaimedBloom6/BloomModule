import PriceUtils from "../../BloomCore/PriceUtils"
import { onSetSlotReceived, onWindowItemsPacket } from "../../BloomCore/utils/Events"
import { S2FPacketSetSlot, S30PacketWindowItems, addLinesToItemStackLore, fn, getSkyblockItemID, round } from "../../BloomCore/utils/Utils"
import Config from "../Config"

const processItem = (itemStack) => {
    const sbID = getSkyblockItemID(itemStack)
    if (!sbID) return

    const value = PriceUtils.getSellPrice(sbID, true) ?? 0
    if (value == null) return

    const [price, location] = value
    const toAdd = [""]

    if (Config.itemPriceLore) {
        // Item is on BIN
        if (location == PriceUtils.locations.AUCTION) {
            toAdd.push(`§dLowest BIN: §6${fn(Math.floor(price))} coins`)
        }

        // Item is on Bazaar
        else if (location == PriceUtils.locations.BAZAAR) {
            const buyPrice = PriceUtils.getPrice(sbID, false) ?? 0
            toAdd.push(`§dBazaar Insta-Buy: §6${fn(Math.floor(buyPrice))} coins`)
            toAdd.push(`§dBazaar Insta-Sell: §6${fn(Math.floor(price))} coins`)
        }
    }

    if (Config.itemValueLore) {
        const value = PriceUtils.getItemValue(itemStack)
        if (value !== null) {
            toAdd.push(`§dItem Value: §6${fn(Math.floor(value))} coins`)
        }
        
    }
    addLinesToItemStackLore(itemStack, toAdd)
}

onWindowItemsPacket((items) => {
    if (!Config.itemPriceLore && !Config.itemValueLore) return

    items.forEach(itemStack => processItem(itemStack))
})

onSetSlotReceived((item) => {
    if (!Config.itemPriceLore && !Config.itemValueLore) return

    processItem(item)
})