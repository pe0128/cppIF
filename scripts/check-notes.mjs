import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dist = path.resolve('docs/.vitepress/dist');
const files = fs.readdirSync('docs', { recursive: true })
	.filter(file => file.endsWith('.md') && !file.startsWith('.vitepress'));
const sectionIds = [];
let snippets = 0;
const disallowed = /总结|概括要点|八股|复习|口诀|一句话|总之|综上|核心思想|最重要|意义是什么|高频|强烈推荐|简单理解/;

assert(!fs.existsSync('docs/index.md'), 'The presentation homepage must not return.');
assert(!fs.existsSync('docs/overview.md'), 'The summary page must not return.');
assert(!fs.existsSync('docs/guide/roadmap.md'), 'The review roadmap must not return.');

for (const file of files) {
	const markdown = fs.readFileSync(`docs/${file}`, 'utf8');
	assert(!markdown.includes('\uFFFD'), `Invalid text in ${file}`);
	sectionIds.push(...[...markdown.matchAll(/\{#source-(\d+)\}/g)].map(match => Number(match[1])));
	let fence = '';
	for (const [index, line] of markdown.split('\n').entries()) {
		if (line.startsWith('```')) {
			fence = fence ? '' : line.slice(3).trim();
			if (fence === 'cpp') ++snippets;
			continue;
		}
		if (fence && fence !== 'text') {
			assert(!/^ +\S/.test(line), `Use Tab indentation in ${file}:${index + 1}`);
			continue;
		}
		const prose = line.replace(/\]\([^)]+\)/g, ']');
		assert(!disallowed.test(prose), `Editorial phrasing in ${file}:${index + 1}`);
		assert(!prose.includes('/'), `Slash separator in ${file}:${index + 1}`);
		assert(!prose.includes('：'), `Explanatory colon in ${file}:${index + 1}`);
	}
	assert.equal(fence, '', `Unclosed code fence in ${file}`);
}

// The original version outline and two review sections are intentionally omitted.
const original = fs.readFileSync('cppInterviewFundamentals.md', 'utf8');
const originalSections = [...original.matchAll(/^# [一二三四五六七八九十百零]+、/gm)];
assert.equal(originalSections.length, 162);
assert.deepEqual(sectionIds.sort((a, b) => a - b), Array.from({ length: 159 }, (_, i) => i + 2));

const newSource = fs.readFileSync('cppNewFeature.md', 'utf8').replaceAll('\r\n', '\n');
let newFeatures = 0;
for (const [, version, source] of newSource.matchAll(/^# C\+\+(14|17|20|23)\n([\s\S]*?)(?=^# C\+\+|$(?![\s\S]))/gm)) {
	const expected = [...source.matchAll(/^## (\d+)\./gm)].map(match => Number(match[1]));
	const output = fs.readFileSync(`docs/versions/cpp${version}.md`, 'utf8');
	const actual = [...output.matchAll(/\{#feature-(\d+)\}/g)].map(match => Number(match[1]));
	assert.deepEqual(actual, expected, `Feature coverage for C++${version}`);
	for (const feature of output.split(/(?=^## )/m).slice(1)) {
		assert(feature.includes('### 语法与行为'), 'Missing behavior description');
		assert(feature.includes('### 使用场景与差异'), 'Missing use cases');
		assert(feature.includes('### 用法'), 'Missing usage');
	}
	newFeatures += expected.length;
}
assert.equal(newFeatures, 103);

for (const file of ['package.json', 'docs/.vitepress/config.mts', 'docs/.vitepress/topics.json']) {
	assert(!/^ +\S/m.test(fs.readFileSync(file, 'utf8')), `Use Tab indentation in ${file}`);
}

let links = 0;
const htmlFiles = fs.readdirSync(dist, { recursive: true }).filter(file => file.endsWith('.html'));
assert.equal(htmlFiles.length, files.length + 1, 'Unexpected generated pages');
const root = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
assert(root.includes('C++98'));
assert(!/class="[^"]*\b(?:VPHome|VPHero)\b/.test(root), 'Root must show a note');
for (const file of htmlFiles) {
	const html = fs.readFileSync(path.join(dist, file), 'utf8');
	for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
		const url = new URL(match[1].replaceAll('&amp;', '&'), `https://pe0128.github.io/cppIF/${file.replaceAll('\\', '/')}`);
		if (url.origin !== 'https://pe0128.github.io' || !url.pathname.startsWith('/cppIF/')) continue;
		let relative = decodeURIComponent(url.pathname.slice('/cppIF/'.length));
		if (!relative || relative.endsWith('/')) relative += 'index.html';
		let target = path.join(dist, relative);
		if (!fs.existsSync(target) && !path.extname(target)) target += '.html';
		assert(fs.existsSync(target), `Missing ${match[1]} from ${file}`);
		if (url.hash && target.endsWith('.html')) {
			assert(fs.readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${match[1]} from ${file}`);
		}
		++links;
	}
}
console.log(JSON.stringify({ notes: files.length, originalKnowledgeSections: sectionIds.length, newFeatures, cppSnippets: snippets, renderedPages: htmlFiles.length, internalLinksAndAssets: links, result: 'passed' }));
