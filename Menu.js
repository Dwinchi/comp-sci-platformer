import { drawText, GC, menu, BTN, AXIS, Transition } from "./Game.js";

export class MainMenu {
    constructor(x, y , width, height) {
        GC.obj.me.push(this);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.selected = 0;
        
        this.btns = [0,0,0];
        this.btns[0] = new MenuBtn(0,160 - 10,120 + 2 + (0 * 8),"Start");
        this.btns[1] = new MenuBtn(1,160 - 16,120 + 2 + (1 * 8),"Settings");
        this.btns[2] = new MenuBtn(2,160 - 8,120 + 2 + (2 * 8),"Exit");
        
        this.btns[0].selected = 1;

    }

    update() {
        for (const i of this.btns) { i.selected = 0; }

        if (BTN[0]>0) { this.selected--; BTN[0] = -1; }
        if (BTN[1]>0) { this.selected++; BTN[1] = -1; }

        if (this.selected < 0) { this.selected = 2; }
        if (this.selected > 2) { this.selected = 0; }

        this.btns[this.selected].selected = 1;

        if (BTN[7]>0) {
            if (this.selected == 0 ) {
                BTN[7] = -1;
                Transition(50);
            } else if (this.selected == 1) {
                BTN[7] = -1;
                Transition(20,"Main menu");
            }
        }
    }

    draw(ctx) {
/*         let img = document.getElementById("MenuBG");
        ctx.drawImage(img,0,0,320,180,0,0,320,180); */
        
        ctx.fillStyle = "#f5d4ab";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "#855731";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x,this.y, this.width, this.height);
        let logo = document.getElementById("logo");
        ctx.drawImage(logo,116,50);
    }
}

export class MenuBtn {
    constructor(index, x, y, txt) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.txt = txt;
        this.w = txt.length;
        this.h = 8;
        this.selected = 0;

        GC.obj.me.push(this);
    }

    update() { }

    draw(ctx) {
        if (menu.selected == this.index) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(this.x - 6, this.y + 2, 4, 1);
            ctx.fillRect(this.x + (this.txt.length*4) + 3, this.y + 2, 4, 1);
        }
        drawText(this.txt, this.x, this.y, "#000000");
    }
}