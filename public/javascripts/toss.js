const faces = ['H', 'T'];

function flip_coin() {
    var orientation = document.getElementById('coin').style.transform;
    if (orientation == "rotateY(180deg)") {
        show_front();
    } else {
        show_back();
    }
}

function show_front() {
    document.getElementById('coin').style.transform = "rotateY(0deg)";
    document.getElementById('coin-front').hidden = false;
    document.getElementById('coin-back').hidden = true;
}

function show_back() {
    document.getElementById('coin').style.transform = "rotateY(180deg)";
    document.getElementById('coin-front').hidden = true;
    document.getElementById('coin-back').hidden = false;
}

function show_random_face() {
    let face = faces[Math.floor(Math.random() * faces.length)];
    if (face === 'H') {
        show_front();
    } else {
        show_back();
    }
}

function toss() {
    document.getElementById("toss-audio").play();
    let interval = setInterval(() => {
        flip_coin();
    }, 100);
    setTimeout(() => {
        clearInterval(interval);
        show_random_face();
    }, 900);
}