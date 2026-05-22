const fs = require('fs');
const path = require('path');

// Read index.html and parse all IDs and class names
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Simple parser for HTML IDs
const idsInHtml = new Set();
const idRegex = /id="([^"]+)"/g;
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
  idsInHtml.add(match[1]);
}

// Simple parser for classes
const classesInHtml = new Set();
const classRegex = /class="([^"]+)"/g;
while ((match = classRegex.exec(htmlContent)) !== null) {
  match[1].split(/\s+/).forEach(cls => classesInHtml.add(cls));
}

console.log(`Parsed ${idsInHtml.size} IDs and ${classesInHtml.size} classes from index.html`);

// Now let's mock a DOM environment to load app.js
const { Console } = require('console');

// Define global window/document mock
global.window = {
  location: {
    hash: '#page-home',
    replace: () => {},
  },
  scrollTo: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    getItem: (key) => null,
    setItem: (key, val) => {},
  }
};

global.localStorage = global.window.localStorage;

class MockElement {
  constructor(tag, id = null, classes = []) {
    this.tag = tag;
    this.id = id;
    this.classList = {
      classes: new Set(classes),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      toggle: (c) => {
        if (this.classList.classes.has(c)) {
          this.classList.classes.delete(c);
          return false;
        } else {
          this.classList.classes.add(c);
          return true;
        }
      },
      contains: (c) => this.classList.classes.has(c),
    };
    this.style = {};
    this.attributes = {};
    this.listeners = {};
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this.options = [{ text: 'Select option', selectedIndex: 0 }];
    this.selectedIndex = 0;
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  dispatchEvent(event) {
    const name = event.type || event;
    if (this.listeners[name]) {
      this.listeners[name].forEach(cb => cb(event));
    }
  }

  appendChild(child) {
    if (!this.children) this.children = [];
    this.children.push(child);
  }

  setAttribute(name, val) {
    this.attributes[name] = val;
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  querySelector(selector) {
    // Return a generic MockElement if it matches something
    return new MockElement('div');
  }

  querySelectorAll(selector) {
    return [new MockElement('div')];
  }

  closest(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.substring(1);
      if (this.classList.contains(cls)) {
        return this;
      }
    }
    if (selector === '.page-section') {
      return new MockElement('section', 'page-about', ['page-section']);
    }
    return null;
  }
}

global.document = {
  addEventListener: (event, callback) => {
    if (event === 'DOMContentLoaded') {
      // We will trigger this manually
      global.triggerDOMContentLoaded = callback;
    }
  },
  getElementById: (id) => {
    if (idsInHtml.has(id)) {
      const el = new MockElement('div', id);
      if (id === 'client-name' || id === 'client-phone' || id === 'booking-date') {
        el.value = 'Test Value';
      }
      return el;
    }
    console.warn(`app.js tried to getElementById("${id}") which DOES NOT EXIST in index.html`);
    return null;
  },
  querySelectorAll: (selector) => {
    // Simplistic selector matching
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      if (classesInHtml.has(className)) {
        return [new MockElement('div', null, [className])];
      }
    } else if (selector.startsWith('#')) {
      const id = selector.substring(1);
      if (idsInHtml.has(id)) {
        return [new MockElement('div', id)];
      }
    } else {
      return [new MockElement('div')];
    }
    console.warn(`app.js querySelectorAll("${selector}") returned empty because it was not matched in index.html`);
    return [];
  },
  querySelector: (selector) => {
    return new MockElement('div');
  },
  createElement: (tag) => {
    return new MockElement(tag);
  },
  body: new MockElement('body')
};

// Now load app.js
console.log("Loading app.js...");
require('../app.js');

console.log("Triggering DOMContentLoaded...");
try {
  if (global.triggerDOMContentLoaded) {
    global.triggerDOMContentLoaded();
    console.log("SUCCESS: DOMContentLoaded executed without throwing any runtime exceptions!");
  } else {
    console.error("FAILED: DOMContentLoaded event listener was not registered.");
  }
} catch (err) {
  console.error("CRITICAL RUNTIME EXCEPTION IN app.js execution:");
  console.error(err);
}
