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

class highlighted{
    constructor(x, y, width, height, lineSpace){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.lineSpace = lineSpace;
    }

    show(ctx){
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + .5);
        ctx.lineTo(this.x + this.width, this.y + .5);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.x + this.lineSpace, this.y + .5);
        ctx.lineTo(this.x + this.width + this.lineSpace, this.y + .5);
        ctx.stroke();
        ctx.closePath();
    }
}
