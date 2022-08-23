window.onload = () => {
    document.getElementById("navbar-home").addEventListener("click", () => {
        navigate_to('/');
    });

    document.getElementById("navbar-login").addEventListener("click", () => {
        navigate_to('/login');
    });

    document.getElementById("navbar-hamburger").addEventListener("click", () => {
        toggle_hamburger();
    });

    var tiles = [...document.querySelectorAll(".tile")];
    tiles.forEach((tile, index) => {        
        var chevrons = [...tile.querySelectorAll(".tile-info-table-cell-chevron")];
        chevrons.forEach(chevron => {
            chevron.addEventListener("click", () => {            
            toggle_flip(index);
            });
        });
        if(tile.id !== "tile-welcome") {
            var path = tile.id.split('-')[1];
            if(tile.querySelector(".tile-info-table-cell-title")) {
                tile.querySelector(".tile-info-table-cell-title").addEventListener("click", () => {
                    navigate_to("/" + path);
                });
            }
            if(tile.querySelector(".tile-info-table-cell-arrow")) {
                tile.querySelector(".tile-info-table-cell-arrow").addEventListener("click", () => {
                    navigate_to("/" + path);
                });
            }
        }
    });    

    if (document.getElementById("about-show-comment-box")) {
        document.getElementById("about-show-comment-box").addEventListener("click", () => {
            show_comment_box();
        });
    }

    if (document.getElementById("about-email")) {
        document.getElementById("about-email").addEventListener("click", () => {
            copy_to_clipboard();
        });
    }

    if (document.getElementById("about-submit-comment-button")) {
        document.getElementById("about-submit-comment-button").addEventListener("click", () => {
            submit_comment();
        });
    }

    if (document.getElementById("about-cancel-comment-button")) {
        document.getElementById("about-cancel-comment-button").addEventListener("click", () => {
            hide_comment_box();
        });
    }

    if (document.getElementById("roll-all-button")) {
        document.getElementById("roll-all-button").addEventListener("click", () => {
            rollAll();
        });
    }

    if (document.getElementById("clear-all-button")) {
        document.getElementById("clear-all-button").addEventListener("click", () => {
            clearDiceTable();
        });
    }

    if (document.getElementById("add-dice-button")) {
        document.getElementById("add-dice-button").addEventListener("click", () => {
            addDiceToTable();
        });
    }

    if (document.getElementById("coin")) {
        document.getElementById("coin").addEventListener("click", () => {
            toss();
        });
    }
}