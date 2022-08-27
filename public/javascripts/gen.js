function generateNumber() {
    var digit = document.getElementById("digit-selector").value;
    var ones = Math.pow(10, digit - 1);
    var nines = 9 * ones;
    var generated = Math.floor(ones + Math.random() * nines);
    document.getElementById("generated-number").innerHTML = generated;
    copy_to_clipboard("generated-number");
}

function generateUUID() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById("generated-uuid").innerHTML = xmlhttp.responseText;
            copy_to_clipboard("generated-uuid");
        }
    }
    xmlhttp.open("GET", "http://localhost/uuid", true);
    xmlhttp.send();
}