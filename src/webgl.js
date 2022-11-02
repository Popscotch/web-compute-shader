import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

const emojiList = ["❤️", "💩", "👌", "😎", "🔥"]; 
const numberOfAgents = 1024;
const preferredDistance = 32;
const width = window.innerWidth;
const height = window.innerHeight;

const computeShader = `
uniform sampler2D computeTexture;

void main() {
    int numberOfAgents = ${numberOfAgents};
    float preferredDistance = ${preferredDistance}.0;
    float width = ${window.innerWidth}.0;
    float height = ${window.innerHeight}.0;

    // Get Current coord of element 0 to 1
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 coord = texture(computeTexture, uv).xy;

    vec2 otherCoord = coord;
    vec2 newCoord = coord;

    int thisIndex = int(gl_FragCoord.x);
    int closestElementIndex = -1;
    float closestElementDistance = 999999.99;

    for(int i = 0; i < numberOfAgents; i++ ){

        if (i != thisIndex){

            vec2 testUv = vec2(float(i), 0.0) / resolution.xy;
            vec2 testCoord = texture(computeTexture, testUv).xy;

            vec2 realCoord1 = vec2(coord.x * width, coord.y * height);
            vec2 realCoord2 = vec2(testCoord.x * width, testCoord.y * height);

            float distance = distance(realCoord1, realCoord2);

            if(distance < closestElementDistance) {
                closestElementDistance = distance;
                closestElementIndex = i;
            }

        }
    }

    if (closestElementDistance < preferredDistance) {
        vec2 closeUv = vec2(float(closestElementIndex), 0.0) / resolution.xy;
        vec2 closeCoord = texture(computeTexture, closeUv).xy;

        vec2 realCoord1 = vec2(coord.x * width, coord.y * height);
        vec2 realCoord2 = vec2(closeCoord.x * width, closeCoord.y * height);

        float xDiff = realCoord2.x - realCoord1.x;
        float yDiff = realCoord2.y - realCoord1.y;

        float newX = realCoord1.x - (xDiff * 0.05);
        float newY = realCoord1.y - (yDiff * 0.05);

        newCoord = vec2(newX / width, newY / height);
    }

    vec2 testUv = vec2(float(thisIndex), 0.0) / resolution.xy;
    vec2 testCoord = texture(computeTexture, testUv).xy;

    vec4 returnVal = vec4(newCoord, 0.0, 0.0);
    gl_FragColor = returnVal;
}
`;

var objectList = [];

let renderer;
let gpuCompute;
let inputTexture;
let inputTextureVariable;
let myRenderTarget;
let pixels;
let stats;

function init() {
    initRenderer()
    for (let i = 0; i < numberOfAgents; i++) {
        let element = document.createElement("div");
        element.innerText = getEmoji();
        element.style.position = "absolute";
        element.style.left = numberToPx((Math.floor(Math.random() * (width/2) + (width/4))));
        element.style.top = numberToPx((Math.floor(Math.random() * height/2) + (height/4)));

        objectList.push(element);
        document.body.appendChild(element);
    }

    let element = document.createElement("button");
    element.innerText = "start";
    element.onclick = start;
    document.body.appendChild(element);

    update()
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    gpuCompute = new GPUComputationRenderer( numberOfAgents, 1, renderer );
    pixels = new Float32Array(numberOfAgents * 1 * 4);

    inputTexture = gpuCompute.createTexture()
    inputTextureVariable = gpuCompute.addVariable("computeTexture", computeShader, inputTexture);

}

function start() {
    const refreshRate = 60 // Per second
    setInterval(function() {
        update()
    }, 1000 / refreshRate)
}

function update() {
    fillTexture(inputTexture);
    
    const error = gpuCompute.init();
    if ( error !== null ) {
            console.error( error );
    }

    gpuCompute.compute();

    // Read the texture
    myRenderTarget = gpuCompute.getCurrentRenderTarget(inputTextureVariable);
    renderer.readRenderTargetPixels(myRenderTarget, 0, 0, numberOfAgents, 1, pixels);

    for (let i = 0; i < numberOfAgents; i++) {
        var newX = pixels[(i * 4)] * width;
        var newY = pixels[(i * 4) + 1] * height;

        objectList[i].style.left = numberToPx(newX);
        objectList[i].style.top = numberToPx(newY);
    }

    gpuCompute.dispose()
}

function getEmoji() {
    return emojiList[Math.floor(Math.random() * emojiList.length)];
}

function numberToPx(number) {
    return number.toString() + "px";
}

function fillTexture( texture ) {
    const pixels = texture.image.data;

    for (let i = 0; i < numberOfAgents; i++) {
        var coords = getCoordiantes(objectList[i]);
        pixels[(i * 4)] = coords[0] / width;
        pixels[(i * 4) + 1] = coords[1] / height;
    }
}

function pxToNumber(px) {
    return px.slice(0, -2)
}

function getCoordiantes(element) {
    let x = pxToNumber(element.style.left);
    let y = pxToNumber(element.style.top);
    return [x,y];
}

init()