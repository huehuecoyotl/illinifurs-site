function navMenu() {
  var x = document.getElementById("header-bar-content");
  if (x.className === "topnav-content") {
    x.className += " responsive";
  } else {
    x.className = "topnav-content";
  }
  if (x.parentNode.className === "topnav") {
    x.parentNode.className += " responsive";
  } else {
    x.parentNode.className = "topnav";
  }
}