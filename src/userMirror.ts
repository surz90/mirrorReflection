import resources from "./resources";
import { Tag, Color } from "./tag"
import { colorList, orientationList } from "./gameConst"
import { SingleMirror, masterMap } from "./mirrorClass"


const camera = Camera.instance
export const timeoutVar = []

class UserMirror extends SingleMirror {
    static index: number = 0
    static indexBefore: number = 0

    name: string = "user"

    id: number = 0
    isHit: number = 0
    isUsed: boolean = false
    isActive: boolean = false
    isReady: boolean = false

    constructor(position: Vector3, orientation: string, color: string, id: number) {
        super(position, orientation, color)
        this.entity.getComponent(Transform).scale.setAll(0)
        this.id = id
        engine.addSystem(this)
        //ADD TO MASTER MAP
        masterMap.setUserMirrorMap(this.id, this)
    }
    startNew(id) {
        this.id = id
        this.isActive = false
        this.isReady = false
        this.orientation = "xy+"
        this.isHit = 0
        this.entity = new Entity()
        this.position = Vector3.Zero()
        this.entity.addComponent(resources.models.mirrorUserTrans)
        this.entity.addComponent(new Transform({
            position: this.position,
            scale: new Vector3(0, 0, 0)
        }))
        engine.addEntity(this.entity)
    }
    toReady(position: Vector3) {
        this.isActive = false
        this.isReady = true

        this.position = position
        this.setOrientation(this.orientation)
        this.entity.getComponent(Transform).position = position
        this.entity.getComponent(Transform).scale.setAll(1)
    }
    toActive() {
        this.isActive = true
        this.isReady = false
        engine.removeEntity(this.entity)
        this.entity = new Entity()
        this.entity.addComponent(resources.models.mirrorUserFix)
        this.entity.addComponent(new Tag("mirror", this))
        this.entity.addComponent(new Color("white", this))
        this.entity.addComponent(new Transform({
            scale: new Vector3(0,0,0),
            position: this.position
        }))
        this.setOrientation(this.orientation)
        
        engine.addEntity(this.entity)

        setTimeout(() => {
            this.entity.getComponent(Transform).scale.setAll(1)
        }, 1000)
    }
    toRemove() {
        this.isHit = 0
        this.isUsed = false
        this.isActive = false
        this.isReady = false
        engine.removeEntity(this.entity)
        this.startNew(this.id)
    }
    act(position: Vector3) {
        if (!this.isActive) {
            this.orientation = "xy+"
            this.toReady(position)
        }
    }
    setOrientation(orientation) {
        if (orientation !== "") {
            //set orientation and do rotation
            this.orientation = orientation
            this._orientationToRot()
            this._doRotation()
        }
        else {
            log("end of array, remove entity")
            this.toRemove()
            this.startNew(this.id)
            log(this.position, this.isActive, this.isReady)
        }
    }
    static checkDuplicatePos(position: Vector3) {
        for (let i = 0; i < 3; i++) {
            if (userMirror[i].position.x === position.x &&
                userMirror[i].position.y === position.y &&
                userMirror[i].position.z === position.z) {
                return i
            }
        }
        return -1
    }
    static getIndexUserMirror() {
        let idx = UserMirror.index
        //CHECK IF THERE IS MIRROR TOTALLY FREE // .ready = false, .active = false
        let i = 0
        for (i = 0; i < 3; i++) {
            if (userMirror[i].isReady === false && userMirror[i].isActive === false) {
                // set UserMirror.index to next count
                UserMirror.indexBefore = UserMirror.index
                UserMirror.index = i

                return i
            }
        }
        //NO MIRROR IS TOTALLY FREE, POSSIBLE .ready = true or .active = true
        let indexNow = UserMirror.index
        let indexBefore = UserMirror.indexBefore
        let indexLeft = 3 - (UserMirror.indexBefore + UserMirror.index)
        if (indexNow === indexBefore) {
            indexLeft = indexNow
        }

        if (userMirror[indexLeft].isActive === false) {
            UserMirror.indexBefore = UserMirror.index
            UserMirror.index = indexLeft
            return indexLeft
        }
        else if (userMirror[indexBefore].isActive === false) {
            UserMirror.indexBefore = UserMirror.index
            UserMirror.index = indexBefore
            return indexBefore
        }
        else if (userMirror[indexNow].isActive === false) {
            UserMirror.indexBefore = UserMirror.index
            UserMirror.index = indexNow
            return indexNow
        }
        else {
            return -1
        }
    }
    update(dt: number) {
        if (this.isHit === 2) {
            clearTimeout(timeoutVar[this.id])
            this.toRemove()
            log("remove and clearing counter")
        }
    }
}

export let userMirror = [
    new UserMirror(new Vector3(2, -3, 2), "", "white", 0),
    new UserMirror(new Vector3(2, -3, 2), "", "white", 1),
    new UserMirror(new Vector3(2, -3, 2), "", "white", 2),
]

class MirrorPoint {
    static index: number = 0

    parEnt: Entity
    ent: Entity[]
    position: Vector3
    scala: Vector3
    state: number = 0

    constructor() {
        this.parEnt = new Entity()
        this.parEnt.addComponent(new Transform({
            position: Vector3.Zero(),
            scale: new Vector3(1, 1, 1)
        }))
        this.ent = []
        let curEnt = new Entity()


        //log("PILLAR INIzIAtION")
        for (let x = 0; x < 5; x++) {
            curEnt = new Entity()
            curEnt.addComponent(resources.models.mirrorPoint)
            curEnt.addComponent(new Transform({
                position: new Vector3(0, 0, 0),
                scale: new Vector3(0, 0, 0)
            }))
            curEnt.getComponent(Transform).position.y = x * 2 + 2
            curEnt.addComponent(new OnClick(e => {

                log("POINT CLICKED")
                let pos = Vector3.Zero()
                pos.copyFrom(this.ent[x].getComponent(Transform).position)
                log(pos)
                let dupId = UserMirror.checkDuplicatePos(pos)
                if (dupId !== -1) {
                    if (userMirror[dupId].isActive === false) {
                        let idxSearch = orientationList.indexOf(userMirror[dupId].orientation)

                        log("mirror duplicate at", dupId, "with orientation", idxSearch)

                        userMirror[dupId].setOrientation(orientationList[idxSearch + 1])
                    }
                    else log("can't change direction when mirror is active")
                }
                else {
                    let index = UserMirror.getIndexUserMirror()
                    log("mirror not duplicate")
                    log("get index at", index)
                    if(index !== -1) userMirror[index].act(pos)
                }
            }))

            curEnt.setParent(this.parEnt)
            //engine.addEntity(curEnt)
            this.ent.push(curEnt)
        }
        engine.addEntity(this.parEnt)
    }
    act(position: Vector3) {
        for (let entity of this.ent) {
            let transform = entity.getComponent(Transform)
            transform.position.x = position.x
            transform.position.z = position.z

            let check = checkPoint(transform.position)
            //let check = true
            if (check) { transform.scale.setAll(0.8) }
            else { transform.scale.setAll(0) }
        }
    }
}

class userTileMark {
    entity: Entity
    //timerCount: number = 5

    constructor() {
        this.entity = new Entity()
        this.entity.addComponent(resources.models.tileMark)
        this.entity.addComponent(new Transform({
            scale: new Vector3(1.2, 1.2, 1.2),
            position: new Vector3(4, 0.01, 4)
        }))
        this.entity.addComponent(
            new OnClick(e => {
                log(this.entity.getComponent(Transform).position, mirrorPoints[MirrorPoint.index].parEnt.getComponent(Transform).position)
                mirrorPoints[MirrorPoint.index].act(this.entity.getComponent(Transform).position)
                for (let i = 0; i < 3; i++)
                    mirrorPoints[i].parEnt.getComponent(Transform).scale.setAll(1)
                toggleShow = 1
                log("TILE CLICKED", this.entity.getComponent(Transform).position, MirrorPoint.index)
                MirrorPoint.index += 1
                if (MirrorPoint.index === 3) {
                    MirrorPoint.index = 0
                }
            })
        )
        engine.addEntity(this.entity)
        engine.addSystem(this)
    }
    update(dt: number) {
        if (camera.position.x < 32 && camera.position.x > 0
            && camera.position.z < 32 && camera.position.z > 0) {
            let intersect = findIntersectXZPlane()
            //log(intersect)
            if (intersect.x < 32 && intersect.x > 0
                && intersect.z < 32 && intersect.z > 0) {
                if (this.entity.getComponent(Transform).position.x === intersect.x
                    && this.entity.getComponent(Transform).position.z === intersect.z) {

                }
                else {
                    this.entity.getComponent(Transform).position.copyFrom(intersect)
                }
            }
        }

        //this.timerCount -= 1
        //if (this.timerCount < 0) this.timerCount = 10
    }
}

//const uMirror = new UserMirror(new Vector3(4, 4, 4), "", "white")

const mirrorPoints = [
    new MirrorPoint(),
    new MirrorPoint(),
    new MirrorPoint()
]

const tileMark = new userTileMark()

const input = Input.instance

input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, e => {
    log("pointer Up", e)
    for (let i = 0; i < 3; i++) {
        log("i: ", userMirror[i].isActive, userMirror[i].isReady)
        if (userMirror[i].isReady) {
            userMirror[i].toActive()
            timeoutVar[i] = setTimeout(() => {
                log("30 sec passed", i, userMirror[i])
                if (userMirror[i].isActive && !userMirror[i].isReady) {
                    if (userMirror[i].isHit === 0) {
                        userMirror[i].toRemove()
                    }
                }
            }, 30e3);
        }
    }
})

export let toggleShow = 1
input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, e => {
    log("pointer Up", e)
    toggleShow += 1
    for (let i = 0; i < 3; i++) {
        mirrorPoints[i].parEnt.getComponent(Transform).scale.setAll(toggleShow % 2)
    }
})

function findIntersectXZPlane() {
    let vect = new Vector3(0, 0, 1)
    let cam = Vector3.Zero()
    let camRot = Quaternion.Zero()
    let intersectPoint = Vector3.Zero()

    cam.copyFrom(camera.position)
    camRot.copyFrom(camera.rotation)

    vect.rotate(camRot)
    vect.y += cam.y

    let t = (0 - 1 * (cam.y)) / ((vect.y) - (cam.y))
    intersectPoint.x = vect.x * t + cam.x
    intersectPoint.z = vect.z * t + cam.z
    intersectPoint.y = 0

    let intersectPointGrid = posToGrid(intersectPoint)
    return intersectPointGrid
}

function posToGrid(vect: Vector3) {
    let posGrid = Vector3.Zero()
    posGrid.x = Math.floor(((vect.x + 1) / 2)) * 2
    posGrid.y = vect.y
    posGrid.z = Math.floor((vect.z + 1) / 2) * 2

    return posGrid
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