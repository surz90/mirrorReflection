export default {
    models: {
        mirrorBlue: new GLTFShape("models/mirror/mirrorBlue.gltf"),
        mirrorGreen: new GLTFShape("models/mirror/mirrorGreen.gltf"),
        mirrorRed: new GLTFShape("models/mirror/mirrorRed.gltf"),

        mirrorUserTrans: new GLTFShape("models/mirror/mirrorUserTrans.gltf"),
        mirrorUserFix: new GLTFShape("models/mirror/mirrorUserFix.gltf"),
        mirrorPoint: new GLTFShape("models/mirror/mirrorPoint.gltf"),

        laserStart: new GLTFShape("models/laser/laserStart.gltf"),
        laserBlue: new GLTFShape("models/laser/laserBlue.gltf"),
        laserGreen: new GLTFShape("models/laser/laserGreen.gltf"),
        laserRed: new GLTFShape("models/laser/laserRed.gltf"),

        targetBlue: new GLTFShape("models/target/targetBlue.gltf"),
        targetGreen: new GLTFShape("models/target/targetGreen.gltf"),
        targetRed: new GLTFShape("models/target/targetRed.gltf"),

        tile: new GLTFShape("models/floor/tile.gltf"),
        tileMark: new GLTFShape("models/floor/tileMark.gltf"),

        baseMirror: new GLTFShape("models/mirror/baseMirror.gltf"),

        arena: new GLTFShape("models/arena/arena.gltf"),
        door: new GLTFShape("models/arena/door.gltf"),
        frontArena: new GLTFShape("models/arena/frontArena.gltf"),
        robo: new GLTFShape("models/arena/robo.gltf"),
    },
    images: {
        exit: new Texture("images/exit.png"),
        infoBtn: new Texture("images/information.png"),
        info: new Texture("images/UIFront.png")
    }
}