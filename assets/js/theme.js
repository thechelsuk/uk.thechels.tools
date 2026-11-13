// Colour themes, as on thechels.uk: sunrise, day, sunset, night, or "system".
// "system" (nothing saved) follows the device: dark -> night, otherwise day.
// Loaded in <head> (not deferred) so the right theme is applied before the
// page paints; the header picker is wired up once the page has loaded.
(function () {
  var KEY = "theme";
  var MODES = ["sunrise", "day", "sunset", "night"];
  // Choices saved by the earlier light / dark picker.
  var OLD = { light: "day", dark: "night" };
  var root = document.documentElement;
  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function storedChoice() {
    var value = null;
    try { value = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
    if (OLD[value]) value = OLD[value];
    return MODES.indexOf(value) > -1 ? value : "system";
  }

  function resolve(choice) {
    if (MODES.indexOf(choice) > -1) return choice;
    return darkQuery && darkQuery.matches ? "night" : "day";
  }

  function apply(choice) {
    root.setAttribute("data-theme", resolve(choice));
    var buttons = document.querySelectorAll("[data-theme-choice]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-theme-choice") === choice));
    }
  }

  function choose(choice) {
    try {
      if (choice === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, choice);
    } catch (e) { /* storage blocked: still switch for this page */ }
    apply(choice);
  }

  // First paint: no colour transitions until the page has settled.
  apply(storedChoice());
  root.classList.add("no-transition");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.remove("no-transition"); });
  });

  document.addEventListener("DOMContentLoaded", function () {
    apply(storedChoice());

    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-theme-choice]");
      if (button) choose(button.getAttribute("data-theme-choice"));
    });

    // While on "system", follow the device switching light/dark.
    if (darkQuery) {
      var onChange = function () { if (storedChoice() === "system") apply("system"); };
      if (darkQuery.addEventListener) darkQuery.addEventListener("change", onChange);
      else if (darkQuery.addListener) darkQuery.addListener(onChange);
    }
  });
})();
