let prevScrollPos = window.pageYOffset;

window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".container-navbar");
  const currentScrollPos = window.pageYOffset;

  if (prevScrollPos > currentScrollPos) {
    navbar.style.top = "0";
  } else {
    navbar.style.top = "-12.5vh";
  }

  prevScrollPos = currentScrollPos;
});

// const contact = document.getElementById("contactDropdown");
// const contactContent = document.getElementById("contactDropdownContent");

// let isDropdownVisible = false; // Status awal dropdown
// contact.addEventListener("click", () => {
//   if (!isDropdownVisible) {
//     contactContent.style.display = "block"; // Tampilkan dropdown
//     isDropdownVisible = true;
//   } else {
//     contactContent.style.display = "none"; // Sembunyikan dropdown
//     isDropdownVisible = false;
//   }
// });

// document.addEventListener("click", (event) => {
//   if (isDropdownVisible && event.target !== contact && event.target !== contactContent) {
//     contactContent.style.display = "none";
//     isDropdownVisible = false;
//   }
// });

// contactDropdownContent.addEventListener("click", (event) => {
//   event.stopPropagation();
// });
