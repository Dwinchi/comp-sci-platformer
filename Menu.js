import { drawText, GC, menu, BTN, AXIS, Transition, keys } from "./Game.js";

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
                Transition(20,1);
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

    update() {}

    draw(ctx) {
        if (menu.selected == this.index) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(this.x - 6, this.y + 2, 4, 1);
            ctx.fillRect(this.x + (this.txt.length*4) + 3, this.y + 2, 4, 1);
        }
        drawText(this.txt, this.x, this.y, 0);
    }
}

export class Settings {
    constructor() {
        this.w = 113;
        this.h = 84;
        this.x = 160 - Math.floor(this.w / 2);
        this.y = 90 - Math.floor(this.h / 2);
        this.xSelect = 0;
        this.ySelect = 0;

        this.txt = [
            "Audio",
            "Display",
            "Input"
        ]

        GC.obj.se.push(this);
    }

    update() { 
        if (BTN[2]>0) { this.xSelect--; BTN[2] = -1; }
        if (BTN[3]>0) { this.xSelect++; BTN[3] = -1; }

        if (this.xSelect < 0) { this.xSelect = 2; }
        if (this.xSelect > 2) { this.xSelect = 0; }

        if (BTN[5]>0) {
            BTN[5] = -1;
            if (GC.back == 50) {
                while (GC.obj.se.length != 0) { GC.obj.se.shift(); }
                GC.state = 50;
            } else { Transition(GC.back); }
        }
    }

    draw(ctx) {
        let img = document.getElementById("settings");
        ctx.drawImage(img,0,0);
        let k1
        if (keys[2] == "arrowleft") {
            k1 = "<"
        } else k1 = keys[2]

        if (BTN[2]>0 || BTN[2]<0) {
            drawText(this.keycheck(keys[2]), this.x + 3, this.y + 4, 12);
        } else { drawText(this.keycheck(keys[2]), this.x + 3, this.y + 4, 7); }

        if (BTN[3]>0 || BTN[3]<0) {
            drawText(this.keycheck(keys[3]), this.x + 105, this.y + 4, 12);
        } else { drawText(this.keycheck(keys[3]), this.x + 105, this.y + 4, 7); }

        if (this.xSelect == 0) {
            drawText(this.txt[0], this.x + 16, this.y + 4, 12);
        } else { drawText(this.txt[0], this.x + 16, this.y + 4, 7); }

        if (this.xSelect == 1) {
            drawText(this.txt[1], this.x + 42, this.y + 4, 12);
        } else { drawText(this.txt[1], this.x + 42, this.y + 4, 7); }

        if (this.xSelect == 2) {
            drawText(this.txt[2], this.x + 76, this.y + 4, 12);
        } else { drawText(this.txt[2], this.x + 76, this.y + 4, 7); }

        drawText("Press ENTER to exit", this.x + 2, this.y + 76, 7);
    }

    keycheck(key) {
        let k
        if (key == "arrowleft") {
            k = "<";
        } else if (key == "arrowright") {
            k = ">";
        } else k = key;
        k = k.toUpperCase();
        return k;
    }
}