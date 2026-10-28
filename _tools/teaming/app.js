import { $, config } from "/assets/js/toolkit.js";
import { rotate } from "./rotate.js";

const { roles = [] } = config();
const list = $("#roles");

list.replaceChildren(...roles.map((role, i) => {
  const li = document.createElement("li");
  li.className = "role";
  const label = Object.assign(document.createElement("label"), { htmlFor: `role-${i}`, textContent: role.name });
  const input = Object.assign(document.createElement("input"), { type: "text", id: `role-${i}`, placeholder: "Name", autocomplete: "off" });
  const prompts = document.createElement("ul");
  prompts.append(...role.prompts.map((p) => Object.assign(document.createElement("li"), { textContent: p })));
  li.append(label, input, prompts);
  return li;
}));

const inputs = () => [...list.querySelectorAll("input")];
$("#rotate").addEventListener("click", () => {
  const next = rotate(inputs().map((i) => i.value));
  inputs().forEach((input, i) => { input.value = next[i]; });
});
$("#clear").addEventListener("click", () => inputs().forEach((i) => { i.value = ""; }));
