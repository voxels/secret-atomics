import { JSDOM } from 'jsdom';

const html = `
<div class="post-content">
  <p>Start text <img src="p-img.jpg" /> Middle text</p>
  <p>
     <img src="p-only-img.jpg" />
  </p>
  <div>
    <span><img src="span-img.jpg" /></span>
  </div>
  <a href="#">
     <img src="link-img.jpg" />
  </a>
  <table>
     <tr><td><img src="table-img.jpg" /></td></tr>
  </table>
  <p>End text</p>
</div>
`;

const dom = new JSDOM(html);
const doc = dom.window.document;
const contentContainer = doc.querySelector('.post-content');

if (contentContainer) {
  console.log('--- Original ---');
  console.log(contentContainer.innerHTML.replace(/\n\s*/g, ''));

  // ROBUST LIFT LOGIC
  const allImages = Array.from(contentContainer.querySelectorAll('img'));

  for (const img of allImages) {
    // Skip if already top level
    if (img.parentNode === contentContainer) continue;

    const current = img;
    // Bubble up until parent is contentContainer
    while (current.parentNode && current.parentNode !== contentContainer) {
      const parent = current.parentNode;

      // Split parent into Pre and Post
      const pre = parent.cloneNode(false); // Shallow clone (tag + attrs)
      const post = parent.cloneNode(false);

      const childNodes = Array.from(parent.childNodes);
      const idx = childNodes.indexOf(current);

      // Move siblings to pre/post clones
      // Note: We use clones of the siblings to avoid detaching/loop issues?
      // Better: just move them.

      for (let i = 0; i < idx; i++) {
        pre.appendChild(childNodes[i]);
      }
      // current is at idx
      for (let i = idx + 1; i < childNodes.length; i++) {
        post.appendChild(childNodes[i]);
      }

      // Insert into grandparent
      const grandparent = parent.parentNode;
      if (!grandparent) break;

      // Insert Pre (if content)
      // Naive check: if it has children or text.
      // If it's a wrapper like <a> or <span>, we might leave empty ones?
      // Let's keep strictness later. For now, just structure.
      if (pre.childNodes.length > 0) grandparent.insertBefore(pre, parent);

      grandparent.insertBefore(current, parent); // The image (or the subtree being lifted)

      if (post.childNodes.length > 0) grandparent.insertBefore(post, parent);

      grandparent.removeChild(parent); // Remove original parent

      // Current is now child of grandparent. Loop continues.
    }
  }

  console.log('\n--- Processed ---');
  // Format for readability
  console.log(
    contentContainer.innerHTML
      .replace(/>\s+</g, '><')
      .replace(/<img/g, '\n<img')
      .replace(/<p/g, '\n<p')
      .replace(/<div/g, '\n<div')
  );

  // VERIFICATION
  const topLevelImages = Array.from(contentContainer.children).filter((c) => c.tagName === 'IMG');
  console.log(`\nTop level images: ${topLevelImages.length}/${allImages.length}`);
  const remainingNested = contentContainer.querySelectorAll('*:not(.post-content) img');
  console.log(`Remaining nested images: ${remainingNested.length}`);
}
