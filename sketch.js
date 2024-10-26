//////////////////////////////////////////////////
// Object for creation and real-time resize of canvas
// Good function to create canvas and resize functions. I use this in all examples.
const C = {
    loaded: false,
    prop() {return this.height/this.width},
    isLandscape() {return window.innerHeight <= window.innerWidth * this.prop()},
    resize () {
        if (this.isLandscape()) {
          console.log("yes")
            document.getElementById(this.css).style.height = "100%";
            document.getElementById(this.css).style.removeProperty('width');
        } else {
            document.getElementById(this.css).style.removeProperty('height');
            document.getElementById(this.css).style.width = "100%";
        }
    },
    setSize(w,h,p,css) {
        this.width = w, this.height = h, this.pD = p, this.css = css;
    },
    createCanvas() {
        this.main = createCanvas(this.width,this.height,WEBGL), pixelDensity(this.pD), this.main.id(this.css), this.resize();
    }
};

C.setSize(500,500,1,'mainCanvas')

function windowResized () {
    if (document.getElementById(C.css)) {
        C.resize();
    }
}

//////////////////////////////////////////////////
// The example really starts here

let palette = ["#2c695a", "#4ad6af", "#7facc6", "#4e93cc", "#f6684f", "#ffd300"]

// 添加這個新函數
function createCanvasInSection() {
  let canvasContainer = document.getElementById('canvas-container');
  
  if (canvasContainer) {
    let canvas = createCanvas(C.width, C.height, WEBGL);
    canvas.id(C.css);
    canvasContainer.appendChild(canvas.elt);
    pixelDensity(C.pD);
    C.resize();
  } else {
    console.error('無法找到 canvas-container 元素');
  }
}

function setup () {
    createCanvasInSection();
    angleMode(DEGREES);
    background("#fffceb");

    // Scale brushes to adapt to canvas size
    brush.scaleBrushes(1.5);

    // Activate the flowfield we're going to use
    // brush.field("seabed");
    // brush.field("curved");
    brush.field("zigzag");
}

function draw() {

    frameRate(10)
    translate(-width/2,-height/2)

    // brush.box() returns an array with available brushes
    let available_brushes = brush.box();

    // Set the stroke to a random brush, color, and weight = 1
    brush.set(random(available_brushes), random(palette), 1)

    // Draw a random flowLine (x, y, length, direction)
    brush.flowLine(random(width), random(height), random(300,800), random(0,360))

    // Set the stroke to a random brush, color, and weight = 1
    brush.set(random(available_brushes), random(palette), 1)

    // Draw a random flowLine (x, y, length, direction)
    brush.flowLine(random(width), random(height), random(300,800), random(0,360))

    //if (save) saveGif('brush-rain', 15), save = false;
}

let save = true;
