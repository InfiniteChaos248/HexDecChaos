const colors = ["#34568B", "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1", "#955251", "#B565A7", "#009B77", "#DD4124", "#D65076", "#45B8AC", "#EFC050", "#5B5EA6", "#9B2335", "#DFCFBE", "#55B4B0", "#E15D44", "#7FCDCD", "#BC243C", "#C3447A", "#98B4D4"];

function toggle_hamburger() {
    var element_navbar = document.getElementById("navbar");
    if (element_navbar.className === "navbar") {
        element_navbar.className += " responsive";
    } else {
        element_navbar.className = "navbar";
    }
}

function toggle_flip(containerIndex) {
    var orientation = document.getElementsByClassName('tile-content')[containerIndex].style.transform;
    if (orientation == "rotateY(180deg)") {
        document.getElementsByClassName('tile-content')[containerIndex].style.transform = "rotateY(0deg)";
    } else {
        document.getElementsByClassName('tile-back')[containerIndex].style.backgroundColor = random_background_color();
        document.getElementsByClassName('tile-content')[containerIndex].style.transform = "rotateY(180deg)";
    }
}

function set_hidden(id, hidden) {
    document.getElementById(id).hidden = hidden;
}

function toggle_hidden(id) {
    var flag = document.getElementById(id).hidden;
    document.getElementById(id).hidden = !flag;
    return !flag;
}

function random_background_color() {
    const random = Math.floor(Math.random() * colors.length);
    return colors[random];
}

function navigate_to(path) {
    window.location.pathname = path;
}

function show_comment_box() {
    document.getElementById("comment_box_container").style.display = "table-row";
    document.getElementById('submit-comment-response').innerHTML = "";
    document.getElementById('comment-box').value = "";
}
function hide_comment_box() {
    document.getElementById("comment_box_container").style.display = "none";
    document.getElementById('submit-comment-response').innerHTML = "";
    document.getElementById('comment-box').value = "";
}

function copy_to_clipboard(id) {
    var copyText = document.getElementById(id).innerHTML;
    navigator.clipboard.writeText(copyText);
}

function submit_comment() {
    var request = {"comment": document.getElementById('comment-box').value};
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById('submit-comment-response').innerHTML = xmlhttp.responseText;
            document.getElementById('comment-box').value = "";
        }
    }
    xmlhttp.open("POST", url + "submitComment", true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(request));
}