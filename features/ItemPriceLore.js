import PriceUtils from "../../BloomCore/PriceUtils"
import { fn, getSkyblockItemID } from "../../BloomCore/utils/Utils"
import Config from "../Config"
import ListFix from "../../ListFix"

const listField = "toolTip"

/**
 * @param {[number, number]} res The result from calling [getSellPrice] method
 * @param {string?} id The skyblock item ID
 * @param {Item} item
 * @param {*} event The event of the register
 */
const handleItemPrice = (res, id, item, event) => {
    if (!Config.itemPriceLore || !item) return

    const [ price, location ] = res

    // Handle item bin
    if (location === PriceUtils.locations.AUCTION) {
        ListFix.add(event, listField, `§dLowest BIN: §6${fn(Math.floor(price))} coins`)

        return
    }

    if (location !== PriceUtils.locations.BAZAAR) return

    // Handle bz prices
    const buyPrice = PriceUtils.getPrice(id, false) ?? 0

    // If left shift is held down while the tool tip is being rendered
    // we add the actual value taking into consideration item stack size
    if (Keyboard.isKeyDown(Keyboard.KEY_LSHIFT)) {
        ListFix.add(event, listField, `§dBazaar Insta-Buy: §6${fn(Math.floor(buyPrice * item.getStackSize()))} coins`)
        ListFix.add(event, listField, `§dBazaar Insta-Sell: §6${fn(Math.floor(price * item.getStackSize()))} coins`)

        return
    }

    // Else if shift is not held just normal value
    ListFix.add(event, listField, `§dBazaar Insta-Buy: §6${fn(Math.floor(buyPrice))} coins`)
    ListFix.add(event, listField, `§dBazaar Insta-Sell: §6${fn(Math.floor(price))} coins`)
}

/**
 * @param {Item} item
 * @param {*} event
 */
const handleItemValue = (item, event) => {
    if (!Config.itemValueLore) return

    const value = PriceUtils.getItemValue(item)
    if (value == null) return

    ListFix.add(event, listField, `§dItem Value: §6${fn(Math.floor(value))} coins`)
}

register(net.minecraftforge.event.entity.player.ItemTooltipEvent, (event) => {
    const item = new Item(event.itemStack)

    const sbID = getSkyblockItemID(item)
    if (!sbID) return

    const value = PriceUtils.getSellPrice(sbID, true) ?? 0
    if (value == null) return

    handleItemPrice(value, sbID, item, event)
    handleItemValue(item, event)
})