import resources from "./resources"
import { Tag, Color } from "./tag"
import { colorList, orientationList } from "./gameConst"
import { laser } from "./laseSystem"
import { uScore } from "./userScore";
import { masterMap } from "./mirrorClass"
import { showAddScore } from "./userScore"

export class SingleMonster {
    isAlive = false
	isHit = false
    color: string 

    entity: Entity
    position: Vector3
	transform: Transform
    id: number

	finishMove: boolean = false

    currentPos: Vector3 = Vector3.Zero()
    targetPos: Vector3 = Vector3.Zero()
    lerpFraction: number = 0

    _MOVE: number = 120
    countMove: number = 120 //monster will move every x sec

    constructor(color: string, id: number) {
        this.isAlive = false
        this.isHit = false
		this.color = color
        this.id = id

        this.entity = new Entity()
        this.entity.addComponent(this.getModelFromColor(color))
        this.entity.addComponent(new Tag("monster", this))
        this.entity.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
			scale: new Vector3(0, 0, 0)
        }))
        engine.addEntity(this.entity)
        this.transform = this.entity.getComponent(Transform)
        this.position = this.transform.position
        log("MONSTER ADDED TO ENGINE")
        engine.addSystem(this)
        
        //ADD TO MAP
        masterMap.setMonsterMap(this.id, this)
    }
    act(targetPos: Vector3) {
        this.isAlive = true
        this.entity.getComponent(Transform).scale.setAll(1)

        this.currentPos.x = targetPos.x
        this.currentPos.z = targetPos.z
        this.currentPos.y = 12

        this.setTargetPos(targetPos)
    }
    deact() {
        this.isAlive = false
        engine.removeSystem(this)
        engine.removeEntity(this.entity)
    }
    setTargetPos(targetPos: Vector3) {
        this.targetPos = targetPos

        log("UPDATE MAP")
        let allMap = masterMap.combineMap(
            masterMap.getBaseMirrorMap(),
            masterMap.getUserMirrorMap(),
            masterMap.getMonsterMap()
        )
        log("length: ", allMap.length)
        for (let mirror of allMap) {
            log(mirror.entity.getComponent(Transform).position)
        }
    }
    getModelFromColor(color: string) {
        if (color === "blue") {
            this.entity.addComponent(new Color("blue", this))
            return resources.models.targetBlue
        }
        if (color === "red") {
            this.entity.addComponent(new Color("red", this))
            return resources.models.targetRed
        }
        if (color === "green") {
            this.entity.addComponent(new Color("green", this))
            return resources.models.targetGreen
        }
    }
    update(dt: number) {
        if (this.countMove >= 0) {
            this.countMove -= dt
        }
        //log(this.countMove)

        if (this.targetPos.x === this.currentPos.x &&
            this.targetPos.y === this.currentPos.y &&
            this.targetPos.z === this.currentPos.z) {
			//log("finish move")
            this.lerpFraction = 0
            this.finishMove = true
        }
        else {
            this.countMove = this._MOVE
            if (this.lerpFraction < 1) {
                this.finishMove = false
                this.transform.position = Vector3.Lerp(
                    this.currentPos, this.targetPos, this.lerpFraction
                )
                this.lerpFraction += dt
            }
            else {
                this.transform.position = this.targetPos
                this.currentPos = this.targetPos
            }
        }
    }
}
/*
const testSingleMon = new SingleMonster("blue", 0)
setTimeout(() => {
    //testSingleMon.act(new Vector3(10, 5, 10))
}, 3000)
*/


export class MonsterSystem {
    static validHit = false

    MAX_MONSTER = 10
    monsterCount: number
    monsters: SingleMonster[] = []
    randPos: Vector3

    constructor() {
        this.monsterCount = this.MAX_MONSTER

        for (let i = 0; i < this.MAX_MONSTER; i++) {

            let nColor = getRandomInt(0, 2)

            this.monsters.push(new SingleMonster(colorList[nColor], i))
            let target = this.getRandomPosition(i, "init")
            this.monsters[i].act(target)
            //engine.addSystem(this.monsters[i])
        }
    }
    getRandomPosition(i: number, cs: string) {
        let pos: Vector3 = Vector3.Zero()

        if (cs === "init") {
            pos = posToGrid(new Vector3(
                getRandomInt(2, 30),
                getRandomInt(2, 10),
                getRandomInt(2, 30)
            ))
            return pos
        }
        else {
            let randPos: Vector3 = Vector3.Zero()
            let currentPos: Vector3 = Vector3.Zero()
            let rPos: Vector3 = Vector3.Zero()
            currentPos.copyFrom(this.monsters[i].transform.position)
            randPos.copyFrom(this.monsters[i].transform.position)

            for (let co = 0; co < 20; co++) {
                rPos.copyFrom(currentPos)
                let axisMove = getRandomInt(0, 2)
                if (axisMove === 0) { //X-AXIS
                    log("current POS x", currentPos)
                    let movement = getRandomInt(2, 20)
                    rPos.x = movement
                }
                else if (axisMove === 1) { //Y-AXIS
                    log("current POS y", currentPos)
                    let movement = getRandomInt(2, 10)
                    rPos.y = movement
                }
                else if (axisMove === 2) { //Z-AXIS
                    log("current POS z", currentPos)
                    let movement = getRandomInt(2, 20)
                    rPos.z = movement
                }
                rPos = posToGrid(rPos)
                log("result", rPos)
                if (checkPointP(rPos)) {
					log("FINAL POSITION: ", rPos)
                    return rPos
                }
            }
            return randPos
        }
    }
    update(dt: number) {
        for (let i = 0; i < this.MAX_MONSTER; i++) {
			//MOVEMENT
            if (this.monsters[i].isAlive) {
                if (this.monsters[i].countMove <= 0 && this.monsters[i].finishMove) {
                    log("moving now")
                    this.monsters[i].setTargetPos(this.getRandomPosition(i, ""))
                }
            }

			//IS HIT
            if (checkInsideRangeRadius(.5, .5, .5,
                this.monsters[i].transform.position,
                laser.entity.getComponent(Transform).position)
            ) {
                //userScore[monsters[i].ID] += 1
                //updateUserScore()
                if (this.monsters[i].isAlive) {
					//COMPARE MONSTER AND LASER COLOR
                    log("COLOR COMPARE: ", laser.color,
                        this.monsters[i].color)

                    log(monsters[i])
                    //log("MONSTER IS HIT")
                    if (laser.color === this.monsters[i].color) {
                        if (MonsterSystem.validHit) {
                            uScore.score += 1
                            showAddScore(0)
                        }
                    }
                    else {
                        showAddScore(1)
                    }

                    this.monsters[i].deact()
                    this.monsterCount -= dt
                    setTimeout(() => {
                        log("WAIT 10 SECOND")
                        log("DEPLOY MONSTER")
                        let nColor = getRandomInt(0, 2)
                        this.monsters[i] = new SingleMonster(colorList[nColor], i)
                        let target = this.getRandomPosition(i, "init")
                        this.monsters[i].act(target)
                    }, 10e3);
                }
            }
        }
    }
}

const monsters = new MonsterSystem()
engine.addSystem(monsters)


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function posToGrid(vect: Vector3) {
    let posGrid = Vector3.Zero()
    posGrid.x = Math.floor(((vect.x + 1) / 2)) * 2
    posGrid.y = Math.floor((vect.y + 1) / 2) * 2
    posGrid.z = Math.floor((vect.z + 1) / 2) * 2
    return posGrid
}

function checkInsideRangeRadius(
    rangeX: number, rangeY: number, rangeZ: number,
    vectRef: Vector3, vectorCheck: Vector3
) {
    if (!(vectorCheck.x > (vectRef.x - rangeX) && vectorCheck.x < (vectRef.x + rangeX))) return false
    if (!(vectorCheck.y > (vectRef.y - rangeY) && vectorCheck.y < (vectRef.y + rangeY))) return false
    if (!(vectorCheck.z > (vectRef.z - rangeZ) && vectorCheck.z < (vectRef.z + rangeZ))) return false
    return true
}

function checkPoint(pos: Vector3) {
    let allMap = []
    allMap = masterMap.combineMap(
        masterMap.getBaseMirrorMap(),
        masterMap.getUserMirrorMap(),
        masterMap.getMonsterMap()
    )
    log(allMap.length)

    for (let mirror of allMap) {
        let p = mirror.entity.getComponent(Transform).position
        if (p.x === pos.x &&
            p.y === pos.y &&
            p.z === pos.z
        ) {
            return false
        }
    }
    return true
}
function checkPointP(pos: Vector3) {
    let allMap = []
    allMap = masterMap.combineMap(
        masterMap.getBaseMirrorMap(),
        masterMap.getUserMirrorMap(),
        masterMap.getMonsterMap()
    )
    log(allMap.length)

    for (let mirror of allMap) {
        let p = mirror.entity.getComponent(Transform).position
		if(p.x === pos.x && p.y === pos.y && p.z === pos.z) return false
		/*
        if (p.x === pos.x) return false
        if (p.y === pos.y) return false
        if (p.z === pos.z) return false
		*/
	
    }
    return true
}
