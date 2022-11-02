const width = window.innerWidth;
const height = window.innerHeight;

const emojiList = ["❤️", "💩", "👌", "😎", "🔥"]; 

const numberOfAgents = 256;
const preferredDistance = 32;

var objectList = [];

function init() {
    // Create the emojis
    for (let i = 0; i < numberOfAgents; i++) {
        let element = document.createElement("div");
        // TODO: Use random emoji list
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
}

function start() {
    const refreshRate = 60 // Per second
    setInterval(function() {
        update()
    }, 1000 / refreshRate)
}

function update() {
    var newCoords = [];

    for (let i = 0; i < numberOfAgents; i++) {
        var iCoordinates = getCoordiantes(objectList[i]);

        // Find the closest element
        var closestElementIndex = -1;
        var closestElementDistance = preferredDistance;
        for (let j = 0; j < numberOfAgents; j++) {
            if (i != j) {
                var jCoordinates = getCoordiantes(objectList[j]);
                var distance = getDistance(iCoordinates[0], iCoordinates[1], jCoordinates[0], jCoordinates[1]);
                if (distance < closestElementDistance) {
                    closestElementDistance = distance;
                    closestElementIndex = j;
                }
            }
        }

        // get new coords
        if (closestElementDistance < preferredDistance) {
            var closestElementCoordinates = getCoordiantes(objectList[closestElementIndex]);

            var xDiff = closestElementCoordinates[0] - iCoordinates[0];
            var yDiff = closestElementCoordinates[1] - iCoordinates[1];

            var newX = iCoordinates[0] - (xDiff * 0.05);
            var newY = iCoordinates[1] - (yDiff * 0.05);

            var newICoordinates = [newX, newY];

            newCoords.push(newICoordinates);
        } else {
            newCoords.push(iCoordinates);
        }
    }
        
    for (i = 0; i < numberOfAgents; i++) {
        objectList[i].style.left = numberToPx(newCoords[i][0]);
        objectList[i].style.top = numberToPx(newCoords[i][1]);
    }
}

function getEmoji() {
    return emojiList[Math.floor(Math.random()*emojiList.length)];
}

function numberToPx(number) {
    return number.toString() + "px";
}

function pxToNumber(px) {
    return px.slice(0, -2)
}

function getCoordiantes(element) {
    let x = pxToNumber(element.style.left);
    let y = pxToNumber(element.style.top);
    return [x,y];
}

function getDistance(x1, y1, x2, y2){
    let y = x2 - x1;
    let x = y2 - y1;
    
    return Math.sqrt(x * x + y * y);
}

init()
