
@Component ("tag")
export class Tag {
    tag: string
    parent: any
    constructor(nameTag: string, parent: any) {
        this.tag = nameTag
        this.parent = parent
    }
}

@Component("color")
export class Color {
    color: string
    parent: any
    constructor(color: string, parent: any) {
        this.color = color
        this.parent = parent
    }
}