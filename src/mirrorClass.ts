import resources from "./resources";
import { Tag } from "./tag"

class SingleMirror {
	position: Vector3
    rotation: Quaternion

	orientation: String
	
	entity: Entity
	
	lerpStart: boolean = false
	lerpOrigin: Vector3
	lerpFinish: Vector3
	lerpFraction: number
	
	slerpStart: boolean
	slerpOrigin: Vector3
	slerpFinish: Vector3
	slerpFraction: number
	
	constructor(position: Vector3, orientation: String){
		this.position = position
		this.orientation = orientation
		
        this.entity = new Entity()
        this.entity.addComponent(resources.models.baseMirror)
        this.entity.addComponent(new Tag("mirror", this))
		this.entity.addComponent(new Transform({
			position: position,
			rotation: Quaternion.Zero()
		}))
        engine.addEntity(this.entity)
        this._doRotation()
	}
    setOrientation(orientation) {
        //set orientation and do rotation
		this.orientation = orientation
		this._orientationToRot()
		this._doRotation()
	}
    _doRotation() {
        this._orientationToRot()
        this.entity.getComponent(Transform).rotation = this.rotation
	}
	_orientationToRot() {
		let rotation: Quaternion

		if (this.orientation === "xy+") rotation = Quaternion.Euler(0, -90, 0).multiply(Quaternion.Euler(0, 45, 0))
		else if (this.orientation === "xy-") rotation = Quaternion.Euler(0, -90, 0).multiply(Quaternion.Euler(0, -45, 0))

		else if (this.orientation === "xz+") rotation = Quaternion.Euler(0, -90, 0).multiply(Quaternion.Euler(45, 0, 0))
		else if (this.orientation === "xz-") rotation = Quaternion.Euler(0, -90, 0).multiply(Quaternion.Euler(-45, 0, 0))

		else if (this.orientation === "yx+") rotation = Quaternion.Euler(90, 0, 0).multiply(Quaternion.Euler(45, 0, 0))
		else if (this.orientation === "yx-") rotation = Quaternion.Euler(90, 0, 0).multiply(Quaternion.Euler(-45, 0, 0))

		else rotation = Quaternion.Euler(0, 0, 0)
		this.rotation = rotation
	}
	getDirectionAfterReflection(direction: Vector3){
        let newDirection: Vector3
        let signDirection: number

        if (this.orientation.substring(0, 2) === "xz") {
            if (Math.abs(direction.x) === 1) newDirection = new Vector3(0, 1, 0)
            else if (Math.abs(direction.y) === 1) newDirection = new Vector3(1, 0, 0)
            else if (Math.abs(direction.z) === 1) return direction
            signDirection = direction.x + direction.y + direction.z
            if (this.orientation[2] === "+") {
                if (signDirection === 1) newDirection.scaleInPlace(-1)
                else newDirection.scaleInPlace(1)
            }
            else {
                newDirection.scaleInPlace(signDirection)
            }
        }
        else if (this.orientation.substring(0, 2) === "xy") {
            if (Math.abs(direction.x) === 1) newDirection = new Vector3(0, 0, 1)
            else if (Math.abs(direction.y) === 1) return direction
            else if (Math.abs(direction.z) === 1) newDirection = new Vector3(1, 0, 0)
            signDirection = direction.x + direction.y + direction.z
            if (this.orientation[2] === "+") newDirection.scaleInPlace(signDirection)
            else {
                if (signDirection === 1) newDirection.scaleInPlace(-1)
                else newDirection.scaleInPlace(1)
            }
        }
        else if (this.orientation.substring(0, 2) === "yx") {
            if (Math.abs(direction.x) === 1) return direction
            else if (Math.abs(direction.y) === 1) newDirection = new Vector3(0, 0, 1)
            else if (Math.abs(direction.z) === 1) newDirection = new Vector3(0, 1, 0)
            signDirection = direction.x +  direction.y + direction.z
            if (this.orientation[2] === "+") {
                if (signDirection === 1) newDirection.scaleInPlace(-1)
                else newDirection.scaleInPlace(1)
            }
            else {
                newDirection.scaleInPlace(signDirection)
            }
        }
        return newDirection
	}
	update(dt: number){
		
	}
}

export const orientationList = ["xy+", "xy-", "xz+", "xz-", "yx+", "yx-"]
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const masterMap = (function () {
    let baseMirrorMap = []

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 2; y++) {
            for (let z = 0; z < 3; z++) {
                let randomOrientation = orientationList[getRandomInt(0, 5)]
                if (x === 1 && y === 1 && z === 1) {
                    baseMirrorMap.push(
                        new SingleMirror(new Vector3(x * 10 + 6, y * 8 + 4, z * 10 + 6),
                            "xz+"
                        ))
                }
                else {
                    baseMirrorMap.push(
                        new SingleMirror(new Vector3(x * 10 + 6, y * 8 + 4, z * 10 + 6),
                            randomOrientation
                        ))
                }
            }
        }
    }
    let userMirrorMap = [[], [], []]
	let monsterMap = [[], [], []]
	
    return {
		getBaseMirrorMap()		{ return baseMirrorMap },
		getUserMirrorMap()		{ return userMirrorMap },
		getMonsterMap()			{ return monsterMap },
        combineMap(...args) {
            log(masterMap.getBaseMirrorMap().length)
			let combineMap = []
            for (let arg of args) {
                for (let mirror of arg) {
                    combineMap.push(mirror)
                }
            }
            return combineMap
		}
    }
})()

let  allMap: SingleMirror[] = []
allMap = masterMap.combineMap(masterMap.getBaseMirrorMap(), masterMap.getUserMirrorMap())
log(allMap.length)
for (let mirror of allMap) {
    log(mirror.position, mirror.orientation)
}


// TEST
let testmirror = allMap[0]
log(testmirror)
log("y- > " + testmirror.getDirectionAfterReflection(new Vector3(0, -1, 0)))
log("y+ > " + testmirror.getDirectionAfterReflection(new Vector3(0, 1, 0)))
log("x- > " + testmirror.getDirectionAfterReflection(new Vector3(-1, 0, 0)))
log("x+ > " + testmirror.getDirectionAfterReflection(new Vector3(1, 0, 0)))
log("z- > " + testmirror.getDirectionAfterReflection(new Vector3(0, 0, -1)))
log("z+ > " + testmirror.getDirectionAfterReflection(new Vector3(0, 0, 1)))


