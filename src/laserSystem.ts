import { masterMap } from "./mirrorClass"
import resources from "./resources"
import {Tag} from "./tag"

export class LaserSystem {
    entity: Entity
    transform: Transform
    position: Vector3
    rotation: Quaternion //MAYBE NOT USED

    direction: Vector3
    targetLock: Vector3 = Vector3.Zero()
    targetParent: any

    pauseMove: boolean

    speed: number = 6
    velocity: Vector3

    constructor(initPosition: Vector3, initDirection: Vector3) {
        this.entity = new Entity()

        this.entity.addComponent(resources.models.laser)
        this.entity.addComponent(new Transform({
            position: initPosition
        }))
        engine.addEntity(this.entity)
        this.transform = this.entity.getComponent(Transform)

        this.position = initPosition
        this.direction = initDirection

        this.velocity = initDirection.scaleInPlace(this.speed)
        this.pauseMove = true

        engine.addSystem(this)
    }
    act() {
        this.pauseMove = false
    }
    deact() {
        this.pauseMove = true
    }
    update(dt: number) {
        if (!this.pauseMove) {
            let physicsCast = PhysicsCast.instance
            let ray: Ray = { origin: this.position, direction: this.velocity, distance: 2 }

            physicsCast.hitFirst(ray, (e) => {
                if (e.didHit) {
                    //log(engine.entities[e.entity.entityId].getComponent(Tag).tag)
                    if (engine.entities[e.entity.entityId].hasComponent(Tag)) {

                        let targetRay = engine.entities[e.entity.entityId].getComponent(Transform).position
                        if (twoVectorIsSame(this.targetLock, targetRay)) {

                        }
                        else {
                            this.targetParent = engine.entities[e.entity.entityId].getComponent(Tag).parent
                            this.targetLock.copyFrom(targetRay)
                            log("CHANGE LOCK: ", targetRay)
                            log(this.targetParent.orientation)
                        }
                    }
                }
                else {
                    //MAYBE TIMEOUT
                    //log(false)
                }
            })

            if (twoVectorIsClose(this.transform.position, this.targetLock, 0.2)) {
                //this.transform.position.copyFrom(this.targetLock)
                this.targetLock = Vector3.Zero()
                log("HITTED")
                log(this.targetParent.orientation)

                //changing velocity
                this.velocity = this.targetParent.getDirectionAfterReflection(this.velocity.normalize()).scaleInPlace(this.speed)
            }

            this.transform.position.addInPlace(this.velocity.scale(1 / 30))



            keepLaserInside(this.entity)

        }
    }
}

export const laser1 = new LaserSystem(new Vector3(16, 16, 16), new Vector3(0, -1, 0))
setTimeout(() => {
    laser1.act()
}, 5000)

export const laser2 = new LaserSystem(new Vector3(16, 0, 16), new Vector3(0, 1, 0))
setTimeout(() => {
    laser2.act()
}, 6000)


const dummyBox = new Entity()
dummyBox.addComponent(new BoxShape())
dummyBox.addComponent(new Transform({
    position: new Vector3(4, 1, 4)
}))
engine.addEntity(dummyBox)

// FUNCTION //
function keepLaserInside(laser: Entity) {
    let ent = laser.getComponent(Transform)
    if (ent.position.x < 0) {
        ent.position.x = 32
    }
    else if (ent.position.x > 32) { ent.position.x = 0 }
    else if (ent.position.z < 0) { ent.position.z = 32 }
    else if (ent.position.z > 32) { ent.position.z = 0 }
    else if (ent.position.y < 0) { ent.position.y = 16 }
    else if (ent.position.y > 16) { ent.position.y = 0 }
    else { return false }
    return true
}

function twoVectorIsSame(a: Vector3, b: Vector3) {
    if (a.x !== b.x) return false
    if (a.y !== b.y) return false
    if (a.z !== b.z) return false
    return true
}

function twoVectorIsClose(origin: Vector3, target: Vector3, radius: number) {
    if (Math.abs(origin.x - target.x) > radius) return false
    if (Math.abs(origin.y - target.y) > radius) return false
    if (Math.abs(origin.z - target.z) > radius) return false
    return true
}

/*
export const laser = new Entity()
laser.addComponent(new LaserData())
laser.addComponent(new GLTFShape("models/LaserReference.gltf"))
laser.addComponent(new Transform({
    position: new Vector3(16, 16, 16),
    rotation: laserDirToRot(laser.getComponent(LaserData).direction),
    //scale: new Vector3(0.2, 0.2, 0.2)
}))
laser.getComponent(LaserData).init()
laser.getComponent(LaserData).canMove = true

const laserBounce = new Entity()
laserBounce.addComponent((new AudioSource(resources.sounds.laserBounce)))
laserBounce.addComponent(new Transform({
    position: Vector3.Zero()
}))
laserBounce.setParent(laser)

const laserDisappear = new Entity()
laserDisappear.addComponent(new AudioSource(resources.sounds.laserDissapear))
laserDisappear.addComponent(new Transform({
    position: Vector3.Zero()
}))
laserDisappear.setParent(laser)

engine.addEntity(laser)

//SYSTEM
let count = 0
class LaserMovement {
    update(dt: number) {
        let laserData = laser.getComponent(LaserData)
        let laserTransform = laser.getComponent(Transform)
        if (laserData.canMove) {
            if (isNear2Digit(laserTransform.position, laserData.targetPos) && count > 10) {

                laserBounce.getComponent(AudioSource).playOnce()
                count = 0
                laserTransform.position.copyFrom(laserData.targetPos)
                laserTransform.rotation = laserDirToRot(laserData.nextDirection)
                laserData.changeNextTarget()
            }
            count += 1
            laserTransform.position.addInPlace(laserData.getMovingVector().scale(dt * laserData.movementSpeed))

            if (keepLaserInside(laser)) {
                laserDisappear.getComponent(AudioSource).playOnce()
                laserData.canMove = false
                laserTransform.scale.setAll(0)
                setTimeout(() => {
                    laserData.canMove = true
                    laserTransform.scale.setAll(1)
                }, 1e3);
            }
            //log(laserTransform.position)
        }
    }
}
engine.addSystem(new LaserMovement())

function laserDirToRot(direction: string) {
    let rotation: Quaternion

    if (direction === "x+") rotation = Quaternion.Euler(0, -90, 0)
    else if (direction === "x-") rotation = Quaternion.Euler(0, 90, 0)

    else if (direction === "y+") rotation = Quaternion.Euler(90, 0, 0)
    else if (direction === "y-") rotation = Quaternion.Euler(-90, 0, 0)

    else if (direction === "z+") rotation = Quaternion.Euler(-180, 0, 0)
    else if (direction === "z-") rotation = Quaternion.Euler(0, 0, 0)
    else rotation = Quaternion.Euler(0, 0, 0)

    return rotation
}


function isNear2Digit(v1: Vector3, v2: Vector3) {
    let diff = v1.subtract(v2).lengthSquared()
    //log(diff)
    if (diff.toFixed(1) === "0.0") return true
    else return false
}

function mapToLoc(normLoc: (string | number)[]) {
    let location = Vector3.Zero()

    location.x = <number>normLoc[0] * 12 + 4
    location.y = <number>normLoc[1] * 8 + 4
    location.z = <number>normLoc[2] * 12 + 4

    return location
}
*/