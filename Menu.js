import { drawText, GC, menu, BTN, AXIS, Transition } from "./Game.js";

export class MainMenu {
    constructor(x, y , width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.selected = 0;
        
        this.btns = [0,0,0];
        this.btns[0] = new MenuBtn(0,0,0,"Start");
        this.btns[1] = new MenuBtn(1,0,0,"Settings");
        this.btns[2] = new MenuBtn(2,0,0,"Exit");
        
        this.btns[0].selected = 1;

        GC.obj.me.push(this);
    }

    update() {
        for (const i of this.btns) { i.selected = 0; }

        if (BTN[0]>0) { this.selected--; BTN[0] = -1; }
        if (BTN[1]>0) { this.selected++; BTN[1] = -1; }

        if (this.selected < 0) { this.selected = 2; }
        if (this.selected > 2) { this.selected = 0; }

        this.btns[this.selected].selected = 1;

        if (this.selected == 0 && BTN[7]>0) {
            Transition(10);
            BTN[7] = -1;
        }
    }

    draw(ctx) {
        let img = document.getElementById("MenuBG");
        ctx.drawImage(img,0,0,320,180);

        ctx.fillStyle = "#f5d4ab";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "#855731";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x,this.y, this.width, this.height);
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
        }
        ctx.fillStyle = "#000";
        ctx.fillRect(menu.x - 4, menu.y + 4 + (this.index * 8), 4, 1);
        drawText(this.txt, menu.x + 2, menu.y + 2 + (this.index * 8), "#000");
    }
}