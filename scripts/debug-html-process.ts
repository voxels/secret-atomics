import { JSDOM } from 'jsdom';

const html = `
<div class="post-content">
  <p>Start text <img src="image1.jpg" /> Middle text</p>
  <p>
     <img src="image2.jpg" />
  </p>
  <div>
    <span><img src="image3.jpg" /></span>
  </div>
  <p>End text</p>
</div>
`;

const dom = new JSDOM(html);
const doc = dom.window.document;
const contentContainer = doc.querySelector('.post-content');

if (contentContainer) {
  console.log('--- Original ---');
  console.log(contentContainer.innerHTML);

  // LOGIC FROM scrape-and-migrate.ts
  const allImages = Array.from(contentContainer.querySelectorAll('img'));
  for (const img of allImages) {
    let parent = img.parentElement;
    let depth = 0;
    while (parent && parent !== contentContainer && depth < 5) {
      const parentTag = parent.tagName.toLowerCase();
      if (['p', 'div', 'figure', 'span', 'a'].includes(parentTag)) {
        const fragment = doc.createDocumentFragment();
        const preC = doc.createElement(parentTag);
        const postC = doc.createElement(parentTag);

        const childNodes = Array.from(parent.childNodes);
        const imgIndex = childNodes.indexOf(img as unknown as ChildNode);

        const preNodes = childNodes.slice(0, imgIndex);
        const postNodes = childNodes.slice(imgIndex + 1);

        preNodes.forEach((n) => preC.appendChild(n.cloneNode(true)));
        postNodes.forEach((n) => postC.appendChild(n.cloneNode(true)));

        if (preC.textContent?.trim()) fragment.appendChild(preC);
        fragment.appendChild(img);
        if (postC.textContent?.trim()) fragment.appendChild(postC);

        parent.replaceWith(fragment);
        parent = img.parentElement;
      } else {
        parent = parent.parentElement;
      }
      depth++;
    }
  }

  console.log('--- Processed ---');
  console.log(contentContainer.innerHTML);
}
