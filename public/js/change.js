function openUserForm() {
    document.getElementById("userForm").style.display = "block";
    document.getElementById("username").style.display = "none";
    document.getElementById("btn-change").style.display = "none";
}

function openPassForm() {
    document.getElementById("passForm").style.display = "flex";
    document.getElementById("password").style.display = "none";
    document.getElementById("btn-change-pass").style.display = "none";
}

function openEmailForm() {
    document.getElementById("emailForm").style.display = "flex";
    document.getElementById("email").style.display = "none";
    document.getElementById("btn-change-email").style.display = "none";
}

function openPhoneForm() {
    document.getElementById("phoneForm").style.display = "flex";
    document.getElementById("phone").style.display = "none";
    document.getElementById("btn-change-phone").style.display = "none";
}

function closeUserForm() {
    document.getElementById("userForm").style.display = "none";
    document.getElementById("username").style.display = "block";
    document.getElementById("btn-change").style.display = "block";
}

function closePassForm() {
    document.getElementById("passForm").style.display = "none";
    document.getElementById("password").style.display = "block";
    document.getElementById("btn-change-pass").style.display = "block";
}

function closeEmailForm() {
    document.getElementById("emailForm").style.display = "none";
    document.getElementById("email").style.display = "block";
    document.getElementById("btn-change-email").style.display = "block";
}
function closePhoneForm() {
    document.getElementById("phoneForm").style.display = "none";
    document.getElementById("phone").style.display = "block";
    document.getElementById("btn-change-phone").style.display = "block";
}