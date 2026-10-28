import { $, config } from "/assets/js/toolkit.js";
import { pickRandom } from "./pick.js";

const { always = [], questions = [], count = 3 } = config();
const items = (list) => list.map((q) => Object.assign(document.createElement("li"), { textContent: q }));

$("#always").replaceChildren(...items(always));
const draw = () => $("#random").replaceChildren(...items(pickRandom(questions, count)));
$("#draw").addEventListener("click", draw);
draw();
