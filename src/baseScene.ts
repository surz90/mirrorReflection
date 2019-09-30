import { Tag } from "./tag"
import resource from "./resources"
import { rect, rectExit, rectInfo, exitButton } from "./userScore"

@Component('lerpNSlerp')
class LerpNslerp{
    lerpFraction: number
    slerpFraction: number
    constructor() {
        this.lerpFraction = 0
        this.slerpFraction = 0
    }
}

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
    position: new Vector3(16, 0, 16),
    rotation: Quaternion.Euler(0, -90, 0)
}))
engine.addEntity(baseArena)
const frontArena = new Entity()
frontArena.addComponent(resource.models.frontArena)
frontArena.addComponent(new Transform({
    position: new Vector3(16, 0, 39.9)
}))
engine.addEntity(frontArena)
const door = new Entity()
door.addComponent(resource.models.door)
door.addComponent(new LerpNslerp())
door.addComponent(new Transform({
    position: new Vector3(16, 0, 32),
    scale: new Vector3(1.5, 1.5, 1.5)
}))
engine.addEntity(door)
const robo = new Entity()
robo.addComponent(resource.models.robo)
robo.addComponent(new LerpNslerp())
robo.addComponent(new Transform({
    position: new Vector3(16, 0.5, 40),
    rotation: Quaternion.Euler(0, 90, 0)
}))
robo.addComponent(new OnClick(e => {
    log("robo clicked")
    //open the gate & animate robo
    if (door.getComponent(LerpNslerp).lerpFraction === 0) {
        engine.addSystem(openGate)
    }
}))
engine.addEntity(robo)

class OpenTheGate {
    update(dt: number) {
        let doorLerp = door.getComponent(LerpNslerp)
        let doorTransform = door.getComponent(Transform)
        let roboLnS = robo.getComponent(LerpNslerp)
        let roboTransform = robo.getComponent(Transform)

        if (doorLerp.lerpFraction < 1) {
            doorLerp.lerpFraction += 0.04
            doorTransform.translate(Vector3.Down().scale(0.4))
            roboTransform.translate(Vector3.Up().scale(0.1))
            roboTransform.rotate(Vector3.Up(), 0.04 * 360)
        }
        else {
            doorLerp.lerpFraction = 1
            engine.removeSystem(this)
        }
    }
}
const openGate = new OpenTheGate()
class CloseTheGate {
    update(dt: number) {
        let doorLerp = door.getComponent(LerpNslerp)
        let doorTransform = door.getComponent(Transform)
        let roboLnS = robo.getComponent(LerpNslerp)
        let roboTransform = robo.getComponent(Transform)

        if (doorLerp.lerpFraction > 0) {
            doorLerp.lerpFraction -= 0.04
            doorTransform.translate(Vector3.Up().scale(0.4))
            roboTransform.translate(Vector3.Down().scale(0.1))
            roboTransform.rotate(Vector3.Down(), 0.04 * 360)
        }
        else {
            doorLerp.lerpFraction = 0
            engine.removeSystem(this)
        }
    }
}
const closeGate = new CloseTheGate()

class OpenTheGateExit {
    update(dt: number) {
        let doorLerp = door.getComponent(LerpNslerp)
        let doorTransform = door.getComponent(Transform)

        if (doorLerp.lerpFraction < 1) {
            doorLerp.lerpFraction += 0.04
            doorTransform.translate(Vector3.Down().scale(0.4))
        }
        else {
            doorLerp.lerpFraction = 1
            engine.removeSystem(this)
        }
    }
}
const openGateExit = new OpenTheGateExit()
class CloseTheGateExit {
    update(dt: number) {
        let doorLerp = door.getComponent(LerpNslerp)
        let doorTransform = door.getComponent(Transform)

        if (doorLerp.lerpFraction > 0) {
            doorLerp.lerpFraction -= 0.04
            doorTransform.translate(Vector3.Up().scale(0.4))
        }
        else {
            doorLerp.lerpFraction = 0
            engine.removeSystem(this)
        }
    }
}
const closeGateExit = new CloseTheGateExit()

exitButton.onClick = new OnClick(() => {
    log("Exit Button Clicked")
    engine.addSystem(openGateExit)
})

const camera = Camera.instance
class UserPosSys {
    static state: boolean
    constructor() {
        if (camera.position.x > 0 && camera.position.x < 32
            && camera.position.z > 0 && camera.position.z < 32) {
            UserPosSys.state = true
        }
        else
            UserPosSys.state = false
    }
    update(dt: number) {
        if (camera.position.x > 0 && camera.position.x < 32
            && camera.position.z > 0 && camera.position.z < 32) {
            if (UserPosSys.state === false) {
                engine.addSystem(closeGate)
                UserPosSys.state = true
            }
            //INSIDE THE BOX
            rectExit.visible = true
            rect.visible = true
        }
        else {
            if (UserPosSys.state === true) {
                UserPosSys.state = false
                engine.addSystem(closeGateExit)
            }
            //OUTSIDE THE BOX
            rectExit.visible = false
            rect.visible = false
        }
    }
}
engine.addSystem(new UserPosSys())