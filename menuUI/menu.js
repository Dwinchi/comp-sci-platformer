class menuScreen{
    constructor(x, y , width, height, playerWon){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.playerWon = playerWon;
    }

    show(context){
        context.fillStyle = "#f5d4ab";
        context.fillRect(this.x, this.y, this.width, this.height);
        context.strokeStyle = "#855731";
        context.lineWidth = 2;
        context.strokeRect(this.x,this.y, this.width, this.height);
    }
}