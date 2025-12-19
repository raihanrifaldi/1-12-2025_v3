// dom.js - DOM Utilities & HTML Loader

/**
 * Load HTML partial ke dalam selector
 * @param {string} selector - CSS selector target
 * @param {string} path - Path ke file HTML
 */
export async function loadHTML(selector, path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    const html = await res.text();
    const target = document.querySelector(selector);
    if (target) {
      target.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
  }
}

/**
 * Load multiple HTML partials
 * @param {Array<{selector: string, path: string}>} partials
 */
export async function loadPartials(partials) {
  await Promise.all(partials.map(({ selector, path }) => loadHTML(selector, path)));
}
