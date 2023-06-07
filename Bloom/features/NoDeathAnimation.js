import Config from "../Config"

const blacklist = [
    /^\w+ Livid$/
]

register("entityDeath", (entity) => {
    if (!Config.noDeathAnimation || blacklist.some(a => entity.getName().match(a))) return
    entity.getEntity().func_70106_y()
})