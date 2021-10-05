const WIDTH = 800;
const HEIGHT = 800;
const ZOOM = 1;
let drawer = new Drawer("MyCanvas", WIDTH, HEIGHT, ZOOM);
drawer.SetColor(30, 30, 30);
drawer.Clear();
drawer.SetColor(200, 0, 0);
drawer.AddPoint(0, 0);
drawer.SetColor(0, 200, 0);
drawer.AddPoint(99, 0);
drawer.SetColor(0, 0, 200);
drawer.AddPoint(0, 99);
//let t0 = performance.now();
//let t1 = performance.now();
//console.log("Call AddLine took " + (t1 - t0) + " ms.");

ReadTextFile("ball.obj", DrawObject);

//drawer.SetUpdate(Update);
//drawer.StartAnimating();
//drawer.SetFpsLimit(60);

let xAnim = 0;
let dxAnim = 1;

let vArrayAnim;
let fArrayAnim;
let alpha = 0;
let colors = [];


function DrawObject(vArray, fArray) {
    vArrayAnim = vArray;
    fArrayAnim = fArray;
    for (let i = 0; i < fArrayAnim.length; i++) {
        colors.push(new Color(GetRandomInteger(255), GetRandomInteger(255), GetRandomInteger(255)));
    }
    drawer.SetUpdate(Update);
    drawer.SetFpsLimit(30);
    drawer.StartAnimating();
}

function Update() {
    drawer.SetColor(30, 30, 30);
    drawer.Clear();
    drawer.SetColor(200, 0, 0);

    for (let index = 0; index < fArrayAnim.length; index++) {
        let triangle = fArrayAnim[index];
        let point1 = YRotate(vArrayAnim[triangle.vertex1 - 1], alpha);
        let point2 = YRotate(vArrayAnim[triangle.vertex2 - 1], alpha);
        let point3 = YRotate(vArrayAnim[triangle.vertex3 - 1], alpha);

        let dx = WIDTH / 2;
        let dy = HEIGHT / 2;
        let objZoom = 200;

        let x0 = Math.round(point1.x * objZoom + dx);
        let y0 = Math.round(point1.y * objZoom + dy);
        let x1 = Math.round(point2.x * objZoom + dx);
        let y1 = Math.round(point2.y * objZoom + dy);
        let x2 = Math.round(point3.x * objZoom + dx);
        let y2 = Math.round(point3.y * objZoom + dy);

        let vec1 = new Vector3(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z);
        let vec2 = new Vector3(point3.x - point1.x, point3.y - point1.y, point3.z - point1.z);
        let n = VecCross(vec1, vec2);
        n = Normalize(n);
        let lightDir = new Vector3(0, 0, 1);
        let intensity = VecDot(n, lightDir);
        if (intensity > 0) {
            drawer.SetColor(intensity * 255, intensity * 255, intensity * 255);
            FillTriangle(x0, y0, x1, y1, x2, y2);
        }        
    }

    drawer.Show();

    alpha += Math.PI / 180;
    if (alpha > 2 * Math.PI) {
        alpha = 0;
    }
}

function VecDot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function VecCross(v1, v2) {
    return new Vector3(v1.z * v2.y - v1.y * v2.z, v1.x * v2.z - v1.z * v2.x, v1.y * v2.x - v1.x * v2.y);
}

function Normalize(v) {
    let length = VLength(v);
    if (length == 0) {
        return new Vector3();
    }
    return new Vector3(v.x / length, v.y / length, v.z / length);
}

function VLength(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function GetRandomInteger(max) {
    return Math.floor(Math.random() * (max + 1));
}

function YRotate(vector, alpha) {
    let matrix = [[Math.cos(alpha), 0, Math.sin(alpha)], 
                  [0, 1, 0], 
                  [-Math.sin(alpha), 0, Math.cos(alpha)]];
    return ProductMV(matrix, vector);
}

function ProductMV(matrix, vector) {
    let row1 = matrix[0]
    let row2 = matrix[1]
    let row3 = matrix[2]
    let newVector = new Vector3(0, 0, 0);
    newVector.x = row1[0] * vector.x + row1[1] * vector.y + row1[2] * vector.z;
    newVector.y = row2[0] * vector.x + row2[1] * vector.y + row2[2] * vector.z;
    newVector.z = row3[0] * vector.x + row3[1] * vector.y + row3[2] * vector.z;
    return newVector;
}

function AddTriangle(x0, y0, x1, y1, x2, y2) {
    AddLine(x0, y0, x1, y1);
    AddLine(x1, y1, x2, y2);
    AddLine(x2, y2, x0, y0);
}

function FillTriangle(x0, y0, x1, y1, x2, y2) {
    if (x0 == x1 && x0 == x2) {
        return;
    }
    if (y0 == y1 && y0 == y2) {
        return;
    }
    if (y1 < y0) {
        [x0, x1] = [x1, x0];
        [y0, y1] = [y1, y0];
    }
    if (y2 < y0) {
        [x0, x2] = [x2, x0];
        [y0, y2] = [y2, y0];
    }
    if (y2 < y1) {
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
    }

    let ctgA = (x2 - x0) / (y2 - y0);
    let ctgB = y1 != y0 ? (x1 - x0) / (y1 - y0) : 0;
    let ctgC = y2 != y1 ? (x2 - x1) / (y2 - y1) : 0;

    let xA = x0;
    let xB = x0;
    let xC = x1;
    let xFrom, xTo;
    for (let y = y0;; y++) {
        xFrom = Math.round(xA);
        xTo = y < y1 ? Math.round(xB) : Math.round(xC);
        if (xTo < xFrom) {
            [xFrom, xTo] = [xTo, xFrom];
        }
        for (let x = xFrom; x <= xTo; x++) {
            drawer.AddPoint(x, y);          
        }

        if (y >= y2) {
            break;
        }

        xA += ctgA;
        if (y < y1) {
            xB += ctgB;
        }
        else {
            xC += ctgC;
        }
    }
}

function AddLine(x0, y0, x1, y1) {
    let isInvert = false;
    if (Math.abs(y1 - y0) > Math.abs(x1 - x0)) {
        [x0, y0] = [y0, x0];
        [x1, y1] = [y1, x1];
        isInvert = true;
    }

    if (x0 > x1) {
        [x0, x1] = [x1, x0];
        [y0, y1] = [y1, y0];
    }

    let xLength = x1 - x0;
    let yLength = Math.abs(y1 - y0);
    let stepY = 2 * yLength;
    let deltaY = 0;
    let y = y0;
    let dy = y1 > y0 ? 1 : -1;
    let doubleXLendth = 2 * xLength;

    for (let x = x0; x <= x1; x++) {
        if (!isInvert) {
            drawer.AddPoint(x, y);
        }
        else {
            drawer.AddPoint(y, x);
        }

        deltaY += stepY;
        if (deltaY > xLength) {
            y += dy;
            deltaY -= doubleXLendth;
        }
    }
}