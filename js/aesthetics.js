// border color
let now = new Date().getHours();
if (now > 20 || now < 7) {
  document.body.style.backgroundColor = '#ffeac3'; //#c3d8ff
  document.getElementById("footer").style.backgroundColor = '#ffeac3';
}
else {
  document.body.style.backgroundColor = '#fffcf6';
  document.getElementById("footer").style.backgroundColor = '#fffcf6';
}
