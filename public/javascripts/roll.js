function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollAll() {
  const dice = [...document.querySelectorAll(".dice-value")];
  dice.forEach(die => {
    roll(die.id, die.id.split('-')[2]);
  });
}

function roll(elementId, d) {
  let animator = setInterval(() => {
    animateRoll(elementId, d);
  }, 20);
  setTimeout(() => {
    clearInterval(animator);
    let result = getRandomNumber(1, d);
    document.getElementById(elementId).innerHTML = result;
    let splitId =  elementId.split('-');
    splitId.shift();
    document.getElementById('result-' + splitId.join('-')).innerHTML = result;
    let modifier = Number(document.getElementById('modifier-' + splitId.join('-')).value);
    document.getElementById('total-' + splitId.join('-')).innerHTML = result + modifier;
  }, 500);
}

function animateRoll(elementId, d) {
  document.getElementById(elementId).innerHTML = getRandomNumber(1, d);
}

function fetchDiceTableState() {
  const dice = [...document.querySelectorAll(".dice-value")];
  const diceTableState = new Map();
  diceTableState.set("20", []);
  diceTableState.set("12", []);
  diceTableState.set("10", []);
  diceTableState.set("8", []);
  diceTableState.set("6", []);
  diceTableState.set("4", []);
  dice.forEach(die => {
    let id = die.id.split("-")[2];
    diceTableState.get(id).push(die);
  });
  return diceTableState;
}

function addDiceToTable() {
  let d = document.getElementById("d-value").value;
  let modifier = document.getElementById("modifier-value").value;
  const diceTableState = fetchDiceTableState();
  document.getElementById("dice-table").appendChild(createDiceElement(d, diceTableState.get(d).length + 1));
  document.getElementById("roll-results").appendChild(createRollResultElement(d, diceTableState.get(d).length + 1, modifier));
  document.getElementById("modifier-value").value = 0;
}

function createDiceElement(d, i) {
  var diceValueDiv = document.createElement("div");
  diceValueDiv.className = "dice-value";
  if(d === "10") {
    diceValueDiv.style = "top: 42%;";
  } else if (d === "6") {
    diceValueDiv.style = "top: 30%;";
  } else if (d === "4") {
    diceValueDiv.style = "left: 55%;";
  }
  diceValueDiv.id = "value-d-" + d + "-" + i;
  diceValueDiv.innerHTML = d;

  var diceImage = document.createElement("img");
  diceImage.className = "dice-image";  
  diceImage.src = "../images/d" + d + ".png";

  var diceDiv = document.createElement("div");
  diceDiv.className = "dice";
  diceDiv.id = "dice-d-" + d + "-" + i;
  diceDiv.appendChild(diceImage);
  diceDiv.appendChild(diceValueDiv);

  return diceDiv;
}

function createRollResultElement(d, index, modifier) {
  var identifierSpan = document.createElement("span");
  identifierSpan.innerHTML = "d" + d + " number " + index + " => ";

  var valueSpan = document.createElement("span");
  valueSpan.id = "result-d-" + d + "-" + index;
  valueSpan.innerHTML = d;

  var modifierInput = document.createElement("input");
  modifierInput.id = "modifier-d-" + d + "-" + index;
  modifierInput.type = "number";
  modifierInput.style="width: 50px;"
  modifierInput.value = modifier;

  var textSpan1 = document.createElement("span");
  textSpan1.innerHTML = "&nbsp; +/- &nbsp;";

  var textSpan2 = document.createElement("span");
  textSpan2.innerHTML = "&nbsp; = &nbsp;";

  var totalValueSpan = document.createElement("span");
  totalValueSpan.id = "total-d-" + d + "-" + index;
  totalValueSpan.innerHTML = Number(d) + Number(modifier);

  if (modifier === "0") {
    modifierInput.hidden = true;
    textSpan1.hidden = true;
    textSpan2.hidden = true;
    totalValueSpan.hidden = true;
  }

  var emptySpaceSpan = document.createElement("span");
  emptySpaceSpan.innerHTML = "&nbsp;&nbsp;&nbsp;";

  var buttonTextSpan = document.createElement("span");
  buttonTextSpan.className = "button-text";
  buttonTextSpan.style="background: hsl(148deg 100% 38%);"
  buttonTextSpan.innerHTML = "Roll";

  var rollButton = document.createElement("button");
  rollButton.className = "pushable-button";
  rollButton.addEventListener("click", () => {
    roll("value-d-" + d + "-" + index, d);
  });
  rollButton.appendChild(buttonTextSpan);

  

  var rollResultDiv = document.createElement("div");
  rollResultDiv.className = "roll-result";
  rollResultDiv.appendChild(identifierSpan);
  rollResultDiv.appendChild(valueSpan);  
  rollResultDiv.appendChild(textSpan1);
  rollResultDiv.appendChild(modifierInput);
  rollResultDiv.appendChild(textSpan2);
  rollResultDiv.appendChild(totalValueSpan);
  rollResultDiv.appendChild(emptySpaceSpan);
  rollResultDiv.appendChild(rollButton);  
    

  return rollResultDiv;
}

function clearDiceTable() {
  document.getElementById("dice-table").innerHTML = "";
  document.getElementById("roll-results").innerHTML = "";
}