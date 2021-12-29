/*
в 1 сантиметре 10 пикселей
В 1 моа 0.75 сантиметров
Сколько моа в 1 пикселе: 10 / 0.75
 */

var moaIn100m = 2.91;
var PixelsInSm = 10;
var lastMiddlePos = {x: 0, y: 0}
var backGroundColor = 'white';
var circlesColor = 'black';
var linesColor = 'black';
var numbersColor = 'black';
var shoots = [];
var circleRadius = 24;

function getContext() {
    const canvas = document.querySelector('#canvas');
    if (!canvas.getContext) {
        return;
    }
    return  canvas.getContext('2d');
}

function draw_number(x, y, number, ctx) {
    ctx.font = '18px sans serif';
    ctx.rect(x, y, 30, ctx.height);
    ctx.fillStyle = numbersColor;
    ctx.fillText(number, x, y);
    ctx.stroke()
}

function getCenterX(ctx) {
    return ctx.canvas.width / 2;
}

function getCenterY(ctx) {
    return ctx.canvas.height / 2;
}

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill()
    }
    if (stroke) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = stroke;
        ctx.stroke()
    }
}

function getDistance() {
    const distanceSpan = document.getElementById("distance");
    return parseInt(distanceSpan.value, 10)
}

function getMoaClickValue() {
    const moaClickValueSpan = document.getElementById("moaClickValue");
    return parseFloat(moaClickValueSpan.value)
}

function drawShoot(ctx, x, y) {
    drawCircle(ctx, x, y, 4, 'red', 'red', 2);
}

function drawMiddleShoot() {
    const ctx = getContext()
    const middle = getMiddle()
    if (middle !== undefined) {
        drawCircle(ctx, middle.x, middle.y, 4, 'green', 'green', 2);
    }
}

function get_polygon_centroid(pts) {
    var first = pts[0];
    var twicearea=0,
        x=0, y=0,
        nPts = pts.length,
        p1, p2, f;
    for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
        p1 = pts[i]; p2 = pts[j];
        f = (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x);
        twicearea += f;
        x += (p1.x + p2.x - 2 * first.x) * f;
        y += (p1.y + p2.y - 2 * first.y) * f;
    }
    f = twicearea * 3;
    return { x:x/f + first.x, y:y/f + first.y };
}

function updateAdvice() {
    let x, y;
    middle = getMiddle();
    const spanRight = document.getElementById("clickRight");
    const spanLeft = document.getElementById("clickLeft");
    const spanUp = document.getElementById("clickUp");
    const spanDown = document.getElementById("clickDown");
    if (middle === undefined && shoots.length == 0) {
        spanUp.textContent = '';
        spanDown.textContent = '';
        spanLeft.textContent = '';
        spanRight.textContent = '';
        return
    }

    if (middle !== undefined) {
        x = middle.x;
        y = middle.y;
        console.log('Вычисляем по СТП', x, y)
    } else {
        x = shoots[shoots.length-1].x;
        y = shoots[shoots.length-1].y;
        console.log('Вычисляем по последней точке', x, y);
    }

    const distance = getDistance();
    const moaClickValue = getMoaClickValue();

    const ctx = getContext()

    // сколько пикселей до центра
    var XtoCenter = x - getCenterX(ctx);
    var YtoCenter = y - getCenterY(ctx);
    console.log('Y to center', YtoCenter)

    const moaInCurrentDist = (moaIn100m / 100) * distance;

    // сколько сантиметров до центра
    const XsmToCenter = XtoCenter / PixelsInSm;
    const YsmToCenter = YtoCenter / PixelsInSm;
    console.log('moa in current dist: ', moaInCurrentDist);
    console.log('сантиметров до центра X:', XsmToCenter);

    // Сколько MOA до центра
    const XmoaToCenter = XsmToCenter / moaInCurrentDist;
    const YmoaToCenter = YsmToCenter / moaInCurrentDist;
    console.log('MOA до центра X: ', XmoaToCenter);

    // Сколько кликов до центра
    const XClick = Math.round(XmoaToCenter / moaClickValue);
    const YClick = Math.round(YmoaToCenter / moaClickValue);
    console.log('Кликов до центра X: ', XClick);

    // Отображение кликов до центра
    if (XClick < 0) {
        spanRight.textContent = Math.abs(XClick);
        spanLeft.textContent = '';
    } else {
        spanLeft.textContent = XClick;
        spanRight.textContent = '';
    }
    if (YClick < 0) {
        spanDown.textContent = Math.abs(YClick);
        spanUp.textContent = '';
    } else {
        spanUp.textContent = YClick;
        spanDown.textContent = '';
    }
}

function drawMesh(ctx) {
    ctx.setLineDash([1, 4]);/*dashes are 5px and spaces are 3px*/
    ctx.beginPath();
    const distance = getDistance()
    const moaInCurrentDist = (moaIn100m / 100) * distance;
    const dist = Math.round(moaInCurrentDist * PixelsInSm)
    // const distance = getDistance()
    // const moaInCurrentDist = (moaIn100m / 100) * distance;
    for (i = 6; i< ctx.canvas.height; i+= dist) {
        ctx.moveTo(0,i); // 200 - высота
        ctx.lineTo(400, i);
    }
    for (i = 6; i< ctx.canvas.width; i+= dist) {
        ctx.moveTo(i,0); // 200 - высота
        ctx.lineTo(i, 400);
    }

    ctx.stroke();
}

function onShoot(ctx, event) {
    const rect = ctx.canvas.getBoundingClientRect();
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
    shoots.push({x, y});
    redrawAll()
}

function redrawAll() {
    removeLastMiddle();
    drawBackground();
    drawShoots();
    drawMiddleShoot();
    updateAdvice();
}

function getMiddle() {
    if (shoots.length >= 3) {
        let centroid = get_polygon_centroid(shoots);
        return centroid
    }
}

function onDistanceChange() {
    removeShoots();
    redrawAll();
}

function removePoint(x, y) {
    const ctx = getContext();
    ctx.clearRect(x-10, y-10, ctx.canvas.width, ctx.canvas.height);
}


function drawShoots() {
    ctx = getContext();
    shoots.forEach(function(item) {
        drawShoot(ctx, item.x, item.y)
    });
}

function removeLastMiddle() {
    const ctx = getContext();
    ctx.clearRect(lastMiddlePos.x-10, lastMiddlePos.y-10, ctx.canvas.width, ctx.canvas.height);
}

function removeShoots() {
    shoots.forEach(function(item) {
        removePoint(item.x, item.y)
    });
    shoots = [];
    redrawAll()
}

function removeLastShoot() {
    ctx = getContext()
    last = shoots.pop()
    removePoint(last.x, last.y)
    redrawAll()
}

const context = getContext()
context.canvas.addEventListener('mousedown', function(e) {
    onShoot(context, e)
});

function drawNumbers(ctx) {
    const centerX = getCenterX(ctx);
    const centerY = getCenterY(ctx);

    var pos_number_start_y = -60;
    var pos_number_diff_y = circleRadius;
    var pos_number_x = centerX + 2;
    const radius = circleRadius;
    for (i = 1; i <= 9; i++) {
        drawCircle(ctx, centerX, centerY, radius * i, null, circlesColor, 2);
    }

    for (i = 1; i <= 9; i++) {
        draw_number(pos_number_x, pos_number_start_y + pos_number_diff_y * i, i, ctx);
    }
}

function drawLines(ctx) {
    ctx.setLineDash([1, 0]);
    ctx.strokeStyle = linesColor;
    ctx.lineWidth = 2;

    const centerX = getCenterX(ctx);
    const centerY = getCenterY(ctx);

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, ctx.canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(ctx.canvas.width, centerY);
    ctx.stroke();
}

function drawBackground() {
    const ctx = getContext();
    drawLines(ctx);
    drawNumbers(ctx);
    drawMesh(ctx);
}

function draw() {
    document.body.style.backgroundColor = backGroundColor;
    drawBackground()
}

draw();
