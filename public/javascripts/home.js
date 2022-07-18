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
  
  function random_background_color() {      
      const random = Math.floor(Math.random() * colors.length);
      return colors[random];
  }

  function navigate_to(path) {
      window.location.pathname = path;
  }