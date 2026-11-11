// Capture REAL product footage from the running app, driven by capture.json.
//   npm i -D playwright && npx playwright install chromium
//   node scripts/capture.mjs [capture.json]
//
// capture.json:
// {
//   "url": "http://localhost:3000",          // or the deployed URL
//   "zoom": 1.5,                              // CSS zoom on <html>: a 1280px layout rendered crisply at 1920×1080
//   "colorScheme": "dark",
//   "steps": [
//     {"goto": "/"},
//     {"shot": "landing"},                    // -> public/shots/landing.png
//     {"text": "landing"},                    // -> capture/landing.txt (page innerText, for fact-checking narration)
//     {"click": "text=Try the sample"},       // any Playwright selector
//     {"fill": ["textarea", "We need to reach women 35–44."], "delayMs": 45},   // typed like a human
//     {"press": "Enter"},
//     {"waitFor": "text=Finished", "timeout": 120000},
//     {"scrollTo": "#results"},               // scrolls the element to the top of the viewport
//     {"wait": 800},
//     {"record": "typing"}, ... {"stop": true} // -> public/clips/typing.mp4 (30 fps, FIXED camera)
//   ]
// }
// Rules learned the hard way: never add an auto-scrolling "follow-cam" while recording (it jitters on screen);
// prefer settled stills + the Remotion <Shot> camera, and record clips only for genuine motion (typing, streaming).
import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.resolve(process.argv[2] ?? path.join(root, 'capture.json')), 'utf8'));
for (const d of ['public/shots', 'public/clips', 'capture']) fs.mkdirSync(path.join(root, d), {recursive: true});

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1920, height: 1080}, colorScheme: cfg.colorScheme ?? 'dark'});
const zoom = cfg.zoom ?? 1;
if (zoom !== 1) await page.addInitScript((z) => addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('zoom', String(z))), zoom);

const cdp = await page.context().newCDPSession(page);
let rec = null; // {name, dir, frames: [{f, t}]}
cdp.on('Page.screencastFrame', async ({data, metadata, sessionId}) => {
	if (rec) {
		const f = path.join(rec.dir, `${String(rec.frames.length).padStart(6, '0')}.jpg`);
		fs.writeFileSync(f, Buffer.from(data, 'base64'));
		rec.frames.push({f, t: metadata.timestamp});
	}
	await cdp.send('Page.screencastFrameAck', {sessionId}).catch(() => {});
});

for (const s of cfg.steps) {
	if (s.goto) await page.goto(new URL(s.goto, cfg.url).href, {waitUntil: 'networkidle'});
	if (s.click) await page.locator(s.click).first().click();
	if (s.fill) await page.locator(s.fill[0]).first().pressSequentially(s.fill[1], {delay: s.delayMs ?? 40});
	if (s.press) await page.keyboard.press(s.press);
	if (s.waitFor) await page.locator(s.waitFor).first().waitFor({timeout: s.timeout ?? 60000});
	if (s.scrollTo) await page.locator(s.scrollTo).first().evaluate((el) => el.scrollIntoView({block: 'start'}));
	if (s.wait) await page.waitForTimeout(s.wait);
	if (s.shot) {
		await page.waitForTimeout(400); // let transitions settle
		await page.screenshot({path: path.join(root, `public/shots/${s.shot}.png`)});
		console.log('shot', s.shot);
	}
	if (s.text) fs.writeFileSync(path.join(root, `capture/${s.text}.txt`), await page.evaluate(() => document.body.innerText));
	if (s.record) {
		const dir = path.join(root, `capture/frames_${s.record}`);
		fs.rmSync(dir, {recursive: true, force: true});
		fs.mkdirSync(dir, {recursive: true});
		rec = {name: s.record, dir, frames: []};
		await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080});
	}
	if (s.stop && rec) {
		await cdp.send('Page.stopScreencast');
		// screencast frames arrive only on change: hold each frame until the next one (ffconcat durations)
		const lines = ['ffconcat version 1.0'];
		rec.frames.forEach((fr, i) => {
			const next = rec.frames[i + 1]?.t ?? fr.t + 0.5;
			lines.push(`file '${fr.f.replaceAll('\\', '/')}'`, `duration ${Math.max(0.001, next - fr.t).toFixed(4)}`);
		});
		const list = path.join(rec.dir, 'list.ffconcat');
		fs.writeFileSync(list, lines.join('\n'));
		const out = path.join(root, `public/clips/${rec.name}.mp4`);
		execFileSync('ffmpeg', ['-v', 'error', '-y', '-safe', '0', '-i', list, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-g', '15', out]);
		console.log('clip', rec.name, rec.frames.length, 'frames');
		rec = null;
	}
}
await browser.close();
