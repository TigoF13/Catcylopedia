function toggleDropdown(contact, contactContent) {
  contact.addEventListener("click", () => {
    contactContent.style.display = isDropdownVisible ? "none" : "block";
    isDropdownVisible = !isDropdownVisible;
  });
}

const contacts = [
  { contact: document.getElementById("contactDropdown"), content: document.getElementById("contactDropdownContent") },
  { contact: document.getElementById("contactDropdown-2"), content: document.getElementById("contactDropdownContent-2") },
  { contact: document.getElementById("contactDropdown-3"), content: document.getElementById("contactDropdownContent-3") },
  { contact: document.getElementById("contactDropdown-4"), content: document.getElementById("contactDropdownContent-4") }
];

let isDropdownVisible = false;

contacts.forEach(({ contact, content }) => {
  toggleDropdown(contact, content);
});
