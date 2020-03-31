document.getElementById("username").addEventListener("focus", () => {
    document.getElementById("userlabel").style.top = 0;
    document.getElementById("userlabel").style.opacity = 1;
});
document.getElementById("username").addEventListener("focusout", () => {
    document.getElementById("userlabel").style.top = "40px";
    document.getElementById("userlabel").style.opacity = 0;
});
document.getElementById("user_pass").addEventListener("focus", () => {
    document.getElementById("passlabel").style.top = 0;
    document.getElementById("passlabel").style.opacity = 1;
});
document.getElementById("user_pass").addEventListener("focusout", () => {
    document.getElementById("passlabel").style.top = "40px";
    document.getElementById("passlabel").style.opacity = 0;
});

