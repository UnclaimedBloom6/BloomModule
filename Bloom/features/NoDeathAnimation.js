import Config from "../Config"

register("entityDeath", (entity) => {
    if (!Config.noDeathAnimation) return
    entity.getEntity().func_70106_y()
})