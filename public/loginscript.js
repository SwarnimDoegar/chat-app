let form = document.getElementById("login-form");
let errorbox = document.getElementById("error-text");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    fetch(event.target.action, {
        method: 'POST',
        body: new URLSearchParams(new FormData(event.target)), // event.target is the form
        //redirect: "follow"
    }).then(result => {
        if (result.redirected) {
            window.location.href = result.url
        }
        else
            return result.text()
    }).then(data => {
        errorbox.textContent = data;
    })
})