import { masterMap } from "./mirrorClass"
import resources from "./resources"
import { Tag, Color } from "./tag"
import { uScore } from "./userScore"
import { SingleMonster, MonsterSystem } from "./monsterSystem"

export class LaserSystem {
    entity: Entity
    transform: Transform
    position: Vector3
    rotation: Quaternion //MAYBE NOT USED
    currentColor: string
    color: string

    entityBlue: Entity
    entityRed: Entity
    entityGreen: Entity

    direction: Vector3
    targetLock: Vector3 = Vector3.Zero()
    targetParent: any

    pauseMove: boolean

    speed: number = 8
    velocity: Vector3

    countMove: number = 0.25

    constructor(initPosition: Vector3, initDirection: Vector3) {
        //starting entity
        this.entity = new Entity()
        this.entity.addComponent(resources.models.laserStart)
        this.entity.addComponent(new Transform({
            position: initPosition
        }))
        engine.addEntity(this.entity)

        //setup variable
        this.transform = this.entity.getComponent(Transform)
        this.position = initPosition
        this.direction = initDirection
        this.velocity = initDirection.scaleInPlace(this.speed)
        this.pauseMove = true
        engine.addSystem(this)

        //blue entity
        this.entityBlue = new Entity()
        this.entityBlue.addComponent(resources.models.laserBlue)
        this.entityBlue.addComponent(new Transform({
            position: initPosition,
            scale: Vector3.Zero()
        }))
        engine.addEntity(this.entityBlue)

        //red entity
        this.entityRed = new Entity()
        this.entityRed.addComponent(resources.models.laserRed)
        this.entityRed.addComponent(new Transform({
            position: initPosition,
            scale: Vector3.Zero()
        }))
        engine.addEntity(this.entityRed)

        //blue entity
        this.entityGreen = new Entity()
        this.entityGreen.addComponent(resources.models.laserGreen)
        this.entityGreen.addComponent(new Transform({
            position: initPosition,
            scale: Vector3.Zero()
        }))
        engine.addEntity(this.entityGreen)
    }
    act() {
        this.pauseMove = false
    }
    deact() {
        this.pauseMove = true
    }
    updateColor() {
        this.entity.getComponent(Transform).scale.setAll(0)
        if (this.currentColor === "blue") {
            this.entity = this.entityBlue
            this.color = "blue"
        }
        if (this.currentColor === "green") {
            this.entity = this.entityGreen
            this.color = "green"
        }
        if (this.currentColor === "red") {
            this.entity = this.entityRed
            this.color = "red"
        }
        this.entity.getComponent(Transform).position = this.position
        this.entity.getComponent(Transform).scale.setAll(1)
    }
    update(dt: number) {
        if (!this.pauseMove) {
            let physicsCast = PhysicsCast.instance
            let ray = { origin: this.position, direction: this.velocity, distance: 3 }

            physicsCast.hitFirst(ray, (e) => {
                if (e.didHit) {
                    //log(engine.entities[e.entity.entityId].getComponent(Tag).tag)
                    if (engine.entities[e.entity.entityId] !== undefined) {
                        if (engine.entities[e.entity.entityId].hasComponent(Tag)) {
                            if (engine.entities[e.entity.entityId].getComponent(Tag).tag === "mirror") {
                                let targetRay = engine.entities[e.entity.entityId].getComponent(Transform).position
                                if (twoVectorIsSame(this.targetLock, targetRay)) {

                                }
                                else {
                                    this.targetParent = engine.entities[e.entity.entityId].getComponent(Tag).parent
                                    this.targetLock.copyFrom(targetRay)
                                    this.currentColor = engine.entities[e.entity.entityId].getComponent(Color).color
                                    //log("CHANGE LOCK: ", targetRay, this.currentColor)
                                    //log(this.targetParent.orientation)
                                }
                            }
                        }
                    }
                }
                else {
                    //MAYBE TIMEOUT
                    //log(false)
                }
            })

            if (twoVectorIsClose(this.transform.position, this.targetLock, 0.3) && this.countMove <= 0) {
                this.countMove = 0.1
                this.transform.position.copyFrom(this.targetLock)
                this.updateColor()

                this.targetLock = Vector3.Zero()
                //log("HIT MIRROR")
                //log(this.targetParent.orientation)

                //check if it is user mirror
                if (this.targetParent.id !== undefined) {
                    MonsterSystem.validHit = true
                    this.targetParent.isHit += 1
                    //log(this.targetParent.id, this.targetParent.isHit)
                }
                else {
                    MonsterSystem.validHit = false
                }
                    
                //changing velocity
                this.velocity = this.targetParent
                    .getDirectionAfterReflection(
                        this.velocity.normalize()).scaleInPlace(this.speed)
            }

            this.transform.position.addInPlace(this.velocity.scale(1 / 30))

            if (this.countMove > 0) {
                this.countMove -= dt
            }

            keepLaserInside(this.entity)

        }
    }
}

export const laser = new LaserSystem(new Vector3(16, 13, 16), new Vector3(0, -1, 0))
setTimeout(() => {
    laser.act()
}, 5000)

//export const laser2 = new LaserSystem(new Vector3(16, 0, 16), new Vector3(0, 1, 0))
//setTimeout(() => {
//    laser2.act()
//}, 6000)

// FUNCTION //
function keepLaserInside(laser: Entity) {
    let ent = laser.getComponent(Transform)
    if (ent.position.x < 0.5) {
        ent.position.x = 31.5
    }
    else if (ent.position.x > 31.5) { ent.position.x = 0.5 }
    else if (ent.position.z < 0.5) { ent.position.z = 31.5 }
    else if (ent.position.z > 31.5) { ent.position.z = 0.5 }
    else if (ent.position.y < 0.5) { ent.position.y = 13.5 }
    else if (ent.position.y > 13.5) { ent.position.y = 0.5 }
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