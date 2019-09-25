
@Component ("tag")
export class Tag {
    tag: string
    parent: any
    constructor(nameTag: string, parent: any) {
        this.tag = nameTag
        this.parent = parent
    }
}