const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Parse all hrefs from the navbar links
const navbarHrefs = [];
const navbarRegex = /<ul class="nav-links">([\s\S]*?)<\/ul>/g;
const navLinksBlock = navbarRegex.exec(htmlContent);

if (navLinksBlock) {
  const hrefRegex = /href="([^"]+)"/g;
  let match;
  while ((match = hrefRegex.exec(navLinksBlock[1])) !== null) {
    navbarHrefs.push(match[1]);
  }
}

console.log("Navbar hrefs:", navbarHrefs);

// Parse all mobile menu links
const mobileHrefs = [];
const mobileRegex = /<div class="mobile-menu"[^>]*>([\s\S]*?)<\/div>/g;
const mobileBlock = mobileRegex.exec(htmlContent);
if (mobileBlock) {
  const hrefRegex = /href="([^"]+)"/g;
  let match;
  while ((match = hrefRegex.exec(mobileBlock[1])) !== null) {
    mobileHrefs.push(match[1]);
  }
}
console.log("Mobile menu hrefs:", mobileHrefs);

// Parse all footer links
const footerHrefs = [];
const footerRegex = /<footer>([\s\S]*?)<\/footer>/g;
const footerBlock = footerRegex.exec(htmlContent);
if (footerBlock) {
  const hrefRegex = /href="([^"]+)"/g;
  let match;
  while ((match = hrefRegex.exec(footerBlock[1])) !== null) {
    footerHrefs.push(match[1]);
  }
}
console.log("Footer hrefs count:", footerHrefs.length);

// Let's verify each target id has a matching element in index.html with class page-section
const allTargetHrefs = new Set([...navbarHrefs, ...mobileHrefs, ...footerHrefs]);

console.log("\nChecking all target hash targets in index.html:");
for (let href of allTargetHrefs) {
  if (href.startsWith('#')) {
    const id = href.substring(1);
    
    // Search for element with this ID and class page-section
    const idRegex = new RegExp(`id="${id}"`, 'i');
    const classRegex = /class="[^"]*page-section[^"]*"/;
    
    const idMatch = idRegex.test(htmlContent);
    if (!idMatch) {
      console.log(`❌ ERROR: Element with id="${id}" does not exist in index.html!`);
      continue;
    }
    
    // Find the tag containing the ID and check if it has class="page-section"
    // Let's extract the opening tag containing the ID
    const tagRegex = new RegExp(`<[^>]*id="${id}"[^>]*>`, 'i');
    const tagMatch = tagRegex.exec(htmlContent);
    if (tagMatch) {
      const tagContent = tagMatch[0];
      const isPageSection = tagContent.includes('page-section');
      console.log(`- Target: ${href} | Match tag: ${tagContent} | Has page-section class: ${isPageSection ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log(`- Target: ${href} | ID exists but opening tag structure is complex.`);
    }
  } else {
    console.log(`- Non-hash / External: ${href}`);
  }
}
