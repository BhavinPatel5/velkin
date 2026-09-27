import { createElement } from "react";

/** Blocking inline script — mirrors `vu-theme-provider` root attrs before first paint. */
export const themeInitScript = `(function(){try{var k="theme",p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var m=p;if(p==="system")m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var d=document.documentElement;d.setAttribute("data-theme",m);d.toggleAttribute("data-theme-light",m==="light");d.toggleAttribute("data-theme-dark",m==="dark");d.toggleAttribute("data-glass",true);d.style.colorScheme=m}catch(e){}})();`;

/** Default SSR `<html>` attrs (script still overrides from localStorage / system). */
export const htmlThemeProps = {
  "data-theme": "light",
  "data-theme-light": "",
  "data-glass": "",
  style: { colorScheme: "light" },
};

/** Put in `<head>` — blocking so first paint matches `VuThemeProvider`. */
export function VuThemeInitScript() {
  return createElement("script", {
    id: "velkin-theme-init",
    dangerouslySetInnerHTML: { __html: themeInitScript },
    suppressHydrationWarning: true,
  });
}
