// DOM helper utilities for building UI components.
export const createElement = (tag, options = {}) => {
  const element = document.createElement(tag);
  const { className, text, html, attrs, children } = options;

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  if (html !== undefined) {
    element.innerHTML = html;
  }

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, value);
      }
    });
  }

  if (children) {
    children.forEach((child) => {
      if (child) {
        element.append(child);
      }
    });
  }

  return element;
};

export const clearElement = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

export const qs = (selector, scope = document) => scope.querySelector(selector);

export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
