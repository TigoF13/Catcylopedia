function openPassForm() {
    document.getElementById("passForm").style.display = "flex";
    document.getElementById("password").style.display = "none";
    document.getElementById("btn-change-pass").style.display = "none";
}

function openPhoneForm() {
    document.getElementById("phoneForm").style.display = "flex";
    document.getElementById("phone").style.display = "none";
    document.getElementById("btn-change-phone").style.display = "none";
}

function closePassForm() {
    document.getElementById("passForm").style.display = "none";
    document.getElementById("password").style.display = "block";
    document.getElementById("btn-change-pass").style.display = "block";
}

function closePhoneForm() {
    document.getElementById("phoneForm").style.display = "none";
    document.getElementById("phone").style.display = "block";
    document.getElementById("btn-change-phone").style.display = "block";
}