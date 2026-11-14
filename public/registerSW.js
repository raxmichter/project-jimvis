if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = new URL("./sw.js", document.currentScript?.src || window.location.href);
    navigator.serviceWorker.register(swUrl.pathname).catch(() => {
      // The app remains fully usable online if installation is unavailable.
    });
  });
}
