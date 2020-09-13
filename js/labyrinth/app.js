class labyrinth {
    constructor (width, height, baseX, baseY){
        this.map = this.makeMap(width, height);
        this.walls = this.makeWalls(this.map);
        this.labyrinth = this.makeLabyrinth(this.map, this.walls);
    }
}