import { DEFAULT_SKIN, SKIN_STORAGE_KEY, SKIN_THEMES } from "./skin";

// Runs in <head> before first paint so a stored skin never flashes the default one.
// data-js marks that scripts run, so JS-only layouts (like the pinned journey) can opt in.
export const skinScript = `(function(){var t=${JSON.stringify(SKIN_THEMES)},d=document.documentElement,s=null;try{s=localStorage.getItem(${JSON.stringify(SKIN_STORAGE_KEY)})}catch(e){}if(!Object.prototype.hasOwnProperty.call(t,s))s=${JSON.stringify(DEFAULT_SKIN)};d.dataset.skin=s;d.dataset.theme=t[s];d.dataset.js="true"})();`;
