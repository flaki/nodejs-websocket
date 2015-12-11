console.log("Libraries loaded.");
window.addEventListener("load", function () {
  console.log("Window loaded.");
  if (require) {
    console.log("Launching bundle...");
    require("bundle")();
  }
});
