
import { JSDOM } from 'jsdom';

async function debug() {
    const url = 'https://noisederived.com/blog/about-the-author/';
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const text = await res.text();
    const dom = new JSDOM(text);
    const doc = dom.window.document;

    console.log('h1:', doc.querySelector('h1')?.textContent);
    console.log('title tag:', doc.querySelector('title')?.textContent);
    console.log('og:title:', doc.querySelector('meta[property="og:title"]')?.getAttribute('content'));
    console.log('.post-title:', doc.querySelector('.post-title')?.textContent);
}

debug();
