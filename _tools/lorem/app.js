import { $, copyText, setStatus } from "/assets/js/toolkit.js";
import { lorem } from "./lorem.js";

const count = $("#count"), output = $("#output"), status = $("#status");
const run = () => { output.value = lorem(Math.min(50, Number(count.value) || 1)); setStatus(status, ""); };

count.addEventListener("input", run);
$("#copy").addEventListener("click", async () => setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok"));
run();
