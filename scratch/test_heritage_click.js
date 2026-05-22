const fs = require('fs');
const path = require('path');

// Mock DOM Environment
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

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
    return new MockElement('div');
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

global.window = {
  location: {
    hash: '#page-home',
  },
  scrollTo: () => {},
  addEventListener: (event, cb) => {
    if (event === 'hashchange') {
      global.window.onhashchange = cb;
    }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  }
};
global.localStorage = global.window.localStorage;
global.document = {
  addEventListener: (event, cb) => {
    if (event === 'DOMContentLoaded') {
      global.document.onDOMContentLoaded = cb;
    } else if (event === 'click') {
      if (!global.document.clickListeners) global.document.clickListeners = [];
      global.document.clickListeners.push(cb);
    }
  },
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => {
    if (id === 'category-shortcuts-container') return new MockElement('div');
    if (id === 'page-about') return new MockElement('section', 'page-about');
    if (id === 'page-home') return new MockElement('section', 'page-home');
    return new MockElement('div');
  },
  querySelectorAll: (selector) => {
    if (selector === '.page-section') {
      return [
        new MockElement('section', 'page-home', ['page-section']),
        new MockElement('section', 'page-about', ['page-section'])
      ];
    }
    if (selector === '.nav-links li') {
      const liHome = new MockElement('li');
      liHome.querySelector = () => ({ getAttribute: () => '#page-home', id: 'nav-item-home' });
      
      const liAbout = new MockElement('li');
      liAbout.querySelector = () => ({ getAttribute: () => '#page-about', id: 'nav-item-about' });
      
      const liHeritage = new MockElement('li');
      liHeritage.querySelector = () => ({ getAttribute: () => '#page-about', id: 'nav-item-heritage' });
      
      return [liHome, liAbout, liHeritage];
    }
    return [];
  }
};

// Load app.js
console.log("Loading app.js...");
require('../app.js');

// Trigger load
console.log("\nTriggering DOMContentLoaded...");
global.document.onDOMContentLoaded();

// Simulate click on HERITAGE nav link
console.log("\nSimulating click on HERITAGE link...");
const clickEvent = {
  target: {
    closest: (sel) => {
      if (sel === 'a') {
        return {
          getAttribute: (attr) => attr === 'href' ? '#page-about' : null,
          id: 'nav-item-heritage'
        };
      }
      return null;
    }
  },
  preventDefault: () => console.log("preventDefault called")
};

global.document.clickListeners.forEach(cb => cb(clickEvent));

// Simulate hashchange
console.log("\nSimulating hashchange to #page-about...");
global.window.location.hash = '#page-about';
global.window.onhashchange();
console.log("SUCCESS: Simulation complete!");
