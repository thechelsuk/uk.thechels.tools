// Runs on every page.
import { wireCopyLink } from "/assets/js/toolkit.js";
import { markDateCells } from "/assets/js/dates.js";
import { wrapTables } from "/assets/js/tables.js";

wireCopyLink();
wrapTables();
markDateCells();
