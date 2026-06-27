// dom.js

export const dom = {
  menuItems: document.querySelectorAll(".menu-item"),
  iframe: document.getElementById("content-frame"),
  logoutBtn: document.getElementById("logoutBtn"),
};

export function activateMenuItem(clickedItem) {
  dom.menuItems.forEach((item) => item.classList.remove("active"));
  if (clickedItem) clickedItem.classList.add("active");
}

export function loadPage(url, clickedItem) {
  dom.iframe.src = url;
  activateMenuItem(clickedItem);
}

export function addMenuItemEventListener() {
  dom.menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      loadPage(this.dataset.url, this);
    });
  });
}

export function setupInitialState() {
  document.addEventListener("DOMContentLoaded", () => {
    const currentUrl = dom.iframe.getAttribute("src");
    const defaultItem = Array.from(dom.menuItems).find(
      (item) => item.dataset.url === currentUrl
    );
    if (defaultItem) defaultItem.classList.add("active");
  });
}

export function setupLogout() {
  dom.logoutBtn.onclick = function () {
    // Optional: Clear session/local storage if used
    sessionStorage.clear();
    localStorage.clear();

    // Redirect to landing page
    window.location.href = "../Landing-page/index.html";
  };
}
