import resources from "./resources";


const canvas = new UICanvas()


export const rect = new UIContainerRect(canvas)
rect.width = '100%'
rect.height = '100%'
rect.opacity = 1
rect.isPointerBlocker = false
const message = new UIText(rect)
message.value = "INIT"
message.fontSize = 30
message.width = 120
message.height = 30
message.vAlign = 'top'
message.hAlign = 'left'
message.positionX = 150
message.positionY = -125
message.isPointerBlocker = false
rect.visible = true
canvas.visible = true

export class userScoreSys {
    score: number
    constructor(score) {
        this.score = score
    }
    update() {
        if (+ message.value !== this.score) {
            log("UPDATE SCORE")
            message.value = this.score.toString()
        }
    }
}
export const uScore = new userScoreSys(0)
engine.addSystem(uScore)


const fixMessage = new UIText(rect)
fixMessage.value = "SCORE :"
fixMessage.fontSize = 30
fixMessage.width = 120
fixMessage.height = 30
fixMessage.vAlign = 'top'
fixMessage.hAlign = 'left'
fixMessage.positionX = 10
fixMessage.positionY = -125
fixMessage.isPointerBlocker = false

const fixMessage2 = new UIText(rect)
fixMessage2.value = "MIRROR RESET IN :"
fixMessage2.fontSize = 15
fixMessage2.width = 120
fixMessage2.height = 30
fixMessage2.vAlign = 'top'
fixMessage2.hAlign = 'left'
fixMessage2.positionX = 10
fixMessage2.positionY = -150
fixMessage2.isPointerBlocker = false

export const MessaageCount = new UIText(rect)
MessaageCount.value = ""
MessaageCount.fontSize = 20
MessaageCount.width = 120
MessaageCount.height = 30
MessaageCount.vAlign = 'top'
MessaageCount.hAlign = 'left'
MessaageCount.positionX = 165
MessaageCount.positionY = -150
MessaageCount.isPointerBlocker = false

const MessaageAdd0 = new UIText(rect)
MessaageAdd0.value = "+1"
MessaageAdd0.fontSize = 50
MessaageAdd0.width = 120
MessaageAdd0.height = 30
MessaageAdd0.vAlign = 'top'
MessaageAdd0.hAlign = 'left'
MessaageAdd0.positionX = 250
MessaageAdd0.positionY = -125
MessaageAdd0.isPointerBlocker = false
MessaageAdd0.visible = false

const MessaageAdd1 = new UIText(rect)
MessaageAdd1.value = "+0"
MessaageAdd1.fontSize = 50
MessaageAdd1.width = 120
MessaageAdd1.height = 30
MessaageAdd1.vAlign = 'top'
MessaageAdd1.hAlign = 'left'
MessaageAdd1.positionX = 250
MessaageAdd1.positionY = -125
MessaageAdd1.isPointerBlocker = false
MessaageAdd1.visible = false

export function showAddScore(addScore: number) {
    let msg
    if (addScore === 0) {
        MessaageAdd0.visible = true
        MessaageAdd1.visible = false
    }
    else if (addScore === 1) {
        MessaageAdd0.visible = false
        MessaageAdd1.visible = true
    }
    setTimeout(() => {
        MessaageAdd0.visible = false
        MessaageAdd1.visible = false
    }, 2000)
}

export const rectExit = new UIContainerRect(canvas)
rectExit.adaptHeight = true
rectExit.adaptWidth = true
rectExit.hAlign = 'left'
rectExit.vAlign = 'top'
rectExit.opacity = 1
rectExit.isPointerBlocker = true
rectExit.visible = false
let exitImg = resources.images.exit
export const exitButton = new UIImage(rectExit, exitImg)
exitButton.name = 'exit'
exitButton.hAlign = 'left'
exitButton.vAlign = 'top'
exitButton.sourceLeft = 0
exitButton.sourceTop = 0
exitButton.sourceWidth = 32
exitButton.sourceHeight = 32
exitButton.width = 50
exitButton.height = 50
exitButton.positionX = 100
exitButton.positionY = -200
exitButton.visible = true

export const rectInfo = new UIContainerRect(canvas)
rectInfo.adaptHeight = true
rectInfo.adaptWidth = true
rectInfo.hAlign = 'left'
rectInfo.vAlign = 'top'
rectInfo.opacity = 1
rectInfo.isPointerBlocker = true
rectInfo.visible = true
let infoBtn = resources.images.infoBtn
export const infoButton = new UIImage(rectInfo, infoBtn)
infoButton.name = 'info'
infoButton.hAlign = 'left'
infoButton.vAlign = 'top'
infoButton.sourceLeft = 0
infoButton.sourceTop = 0
infoButton.sourceWidth = 32
infoButton.sourceHeight = 32
infoButton.width = 50
infoButton.height = 50
infoButton.positionX = 10
infoButton.positionY = -200
infoButton.visible = true

let infoPage = resources.images.info
export const info = new UIImage(rectInfo, infoPage)
info.name = 'info'
info.hAlign = 'left'
info.vAlign = 'top'
info.sourceLeft = 10
info.sourceTop = 0
info.sourceWidth = 512
info.sourceHeight = 512
info.width = 600
info.height = 600
info.positionX = 450
info.positionY = -50
info.visible = false

let showInfo: boolean = false
infoButton.onClick = new OnClick(() => {
    log("Info Button Clicked")
    if (showInfo === false) {
        showInfo = true
        info.visible = true
    }
    else {
        showInfo = false
        info.visible = false
    }
})