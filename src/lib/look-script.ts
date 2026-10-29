import {
  CURRENT_LOOK_KEY,
  DEFAULT_LOOK,
  LAST_LOOK_KEY,
  LOOK_THEMES,
  LOOKS,
  normaliseLookConfig,
  RETIRED_LOOKS,
  type LookConfig,
} from "./look";

// Builds the blocking <head> script that sets data-look before first paint, so the page never
// flashes another look. It mirrors pickLook() in look.ts (covered by the same unit tests):
// the home page picks a new look on every load and never repeats the last one; other pages keep
// the look of this visit. Storage is optional: blocked storage falls back to the default look.
// A retired look found in storage is rewritten to its replacement first.
export function buildLookScript(input: Partial<LookConfig> | null): string {
  const config = normaliseLookConfig(input);
  const data = JSON.stringify({
    looks: LOOKS,
    themes: LOOK_THEMES,
    enabled: config.enabled,
    mode: config.mode,
    fixed: config.fixed,
    fallback: DEFAULT_LOOK,
    retired: RETIRED_LOOKS,
    lastKey: LAST_LOOK_KEY,
    currentKey: CURRENT_LOOK_KEY,
  });

  return `(function(){var c=${data},d=document.documentElement,e=c.enabled,l=null,s=null,k=null;
function ok(v){return c.looks.indexOf(v)>-1}
function mv(v){return v&&Object.prototype.hasOwnProperty.call(c.retired,v)?c.retired[v]:v}
try{l=localStorage.getItem(c.lastKey);if(mv(l)!==l){l=mv(l);localStorage.setItem(c.lastKey,l)}}catch(x){}
try{s=sessionStorage.getItem(c.currentKey);if(mv(s)!==s){s=mv(s);sessionStorage.setItem(c.currentKey,s)}}catch(x){}
var a=location.pathname.indexOf("/admin")===0;
if(a)k=c.fallback;
else if(location.pathname!=="/"&&ok(s))k=s;
else if(c.mode==="fixed")k=c.fixed;
else if(e.length===1)k=e[0];
else if(c.mode==="sequential")k=e[(e.indexOf(l)+1)%e.length];
else{var o=[];for(var i=0;i<e.length;i++)if(e[i]!==l)o.push(e[i]);k=o[Math.floor(Math.random()*o.length)%o.length]}
if(!ok(k))k=c.fallback;
if(!a&&location.pathname==="/"){try{localStorage.setItem(c.lastKey,k)}catch(x){}}
if(!a){try{sessionStorage.setItem(c.currentKey,k)}catch(x){}}
d.dataset.look=k;d.dataset.theme=c.themes[k];d.dataset.looks=e.join(",");d.dataset.js="true"})();`;
}
