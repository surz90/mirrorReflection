const camera = Camera.instance

class logUserMovement {
    update(dt: number) {
        log(camera.position)
    }
}
//engine.addSystem(new logUserMovement())