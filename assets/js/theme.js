// Light / dark / system theme. Loaded in <head> (not deferred) so the
// right theme is applied before the page paints.
(function () {
  var KEY = "theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY) || "system"; } catch (e) { return "system"; }
  }

  function apply(choice) {
    if (choice === "light" || choice === "dark") root.setAttribute("data-theme", choice);
    else root.removeAttribute("data-theme");
    var buttons = document.querySelectorAll("[data-theme-choice]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-theme-choice") === choice));
    }
  }

  apply(stored());

  document.addEventListener("DOMContentLoaded", function () {
    apply(stored());
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-theme-choice]");
      if (!button) return;
      var choice = button.getAttribute("data-theme-choice");
      try {
        if (choice === "system") localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, choice);
      } catch (e) { /* storage blocked: still switch for this page */ }
      apply(choice);
    });
  });
})();
