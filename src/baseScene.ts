import { Tag } from "./tag"
import resource from "./resources"

for (let x = 2; x < 32; x += 2) {
    for (let z = 2; z < 32; z += 2) {
        let tile = new Entity()
        tile.addComponent(resource.models.tile)
        tile.addComponent(new Tag("tile", tile))
        tile.addComponent(new Transform({
            position: new Vector3(x, 0, z)
        }))
        engine.addEntity(tile)
    }
}

const baseArena = new Entity()
baseArena.addComponent(resource.models.arena)
baseArena.addComponent(new Transform({
    position: new Vector3(16, 0, 16)
}))
engine.addEntity(baseArena)