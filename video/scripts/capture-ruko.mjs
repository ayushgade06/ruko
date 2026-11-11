// Real captures of Ruko running on http://127.0.0.1:3100 (local only).
//   node scripts/capture-ruko.mjs [only-sequence-name]
// Phone shots: 430×932 @3x. Every still gets a sibling .json with element boxes (CSS px, document
// coordinates) so the film's highlights land on the real UI without hand-measuring.
// Demo calls run under Playwright's fake clock: we advance the app's own timers line by line and wait
// (in real time) for the real /api/analyze response before each still. Browser TTS is disabled (muted).
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:3100';
const root = path.resolve(import.meta.dirname, '..');
const SHOTS = path.join(root, 'public/shots');
const TEXT = path.join(root, 'capture');
fs.mkdirSync(SHOTS, {recursive: true});
fs.mkdirSync(TEXT, {recursive: true});
const only = process.argv[2];

const PHONE = {viewport: {width: 430, height: 932}, deviceScaleFactor: 3, isMobile: true, hasTouch: true};
const DESK = {viewport: {width: 1440, height: 900}, deviceScaleFactor: 2};

// Same per-line timing the app uses when speech is unavailable (app/listen/page.tsx `speak`).
const silentMs = (text) => 700 + text.length * 45;
const {DEMOS: DEMO_LINES} = await import('../../lib/demos.ts');

const BOXES = `(() => {
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const q = (s) => document.querySelector(s);
  const qa = (s) => [...document.querySelectorAll(s)];
  const h2 = (txt) => qa('h2').find((h) => h.textContent.includes(txt));
  return {
    page: [0, 0, document.documentElement.scrollWidth, document.documentElement.scrollHeight],
    header: r(q('header')),
    status: r(q('main > div.flex')),
    danger: r(q('section[aria-labelledby=hangup-h]')),
    tellFamily: r(q('section[aria-labelledby=hangup-h] button')),
    helplines: qa('section[aria-labelledby=hangup-h] a').map(r),
    meter: r(q('svg[role=img]')?.closest('div.rounded-3xl')),
    sayThis: r(h2('Say this')?.parentElement ?? h2('यह कहें')?.parentElement),
    doNow: r(h2('Do now')?.parentElement ?? h2('अभी करें')?.parentElement),
    flags: r(q('#flags-h')?.parentElement),
    flagItems: qa('#flags-h ~ ul > li').map(r),
    transcript: r(q('details')),
    lines: qa('details ol > li').map(r),
    checkForm: r(q('form')),
    evalTable: r(q('table')),
    steps: r(q('main ol')),
    h1: r(q('h1')),
  };
})()`;

async function newPage(browser, {scheme, tz, phone = true, lang = 'en', region}) {
	const ctx = await browser.newContext({...(phone ? PHONE : DESK), colorScheme: scheme, timezoneId: tz, reducedMotion: 'no-preference'});
	await ctx.addInitScript(({lang, region}) => {
		// Mute the app's browser TTS: the film uses edge-tts character voices instead.
		Object.defineProperty(window, 'speechSynthesis', {value: undefined, configurable: true});
		try {
			localStorage.setItem('ruko-lang', lang);
			if (region) localStorage.setItem('ruko-region', region);
		} catch {}
		const st = document.createElement('style');
		st.textContent = '::-webkit-scrollbar{display:none} *{scrollbar-width:none; caret-color: transparent}';
		document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
	}, {lang, region});
	return ctx.newPage();
}

async function still(page, name, {full = true} = {}) {
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(900); // CSS rise / meter transitions settle (they run on real time)
	await page.screenshot({path: path.join(SHOTS, `${name}.png`), fullPage: full});
	const boxes = await page.evaluate(BOXES);
	boxes.scrollY = await page.evaluate(() => scrollY);
	fs.writeFileSync(path.join(SHOTS, `${name}.json`), JSON.stringify(boxes, null, 1));
	fs.writeFileSync(path.join(TEXT, `${name}.txt`), await page.evaluate(() => document.body.innerText));
	console.log('still', name, boxes.page[3] + 'px tall');
}

// Run one sample call. After each transcript line: a "rules" still (instant on-device verdict), then
// advance past the app's 900 ms debounce, wait for the real AI response, and take an "ai" still.
async function demoCall(browser, {id, prefix, scheme, tz, lang = 'en', keep}) {
	const demo = DEMO_LINES.find((d) => d.id === id);
	const page = await newPage(browser, {scheme, tz, lang});
	const t0 = new Date('2026-11-12T10:00:00Z').getTime();
	await page.clock.install({time: t0});
	await page.goto(`${BASE}/listen?demo=${id}`, {waitUntil: 'networkidle'});
	await page.evaluate(() => document.fonts.ready);
	await page.clock.pauseAt(t0 + 60_000); // freeze app timers: from here on they only move via runFor
	await page.clock.runFor(200);
	await still(page, `${prefix}_00`);
	await page.locator('button', {hasText: demo.title}).first().click({timeout: 5000});
	const log = [];
	// Track /api/analyze traffic so we never miss a request that fires inside a clock step.
	const net = {sent: 0, done: []};
	page.on('request', (r) => r.url().endsWith('/api/analyze') && net.sent++);
	page.on('response', (r) => r.url().endsWith('/api/analyze') && net.done.push(r));
	const finals = () => page.evaluate(() => document.querySelectorAll('details ol > li:not(.italic)').length);
	for (const [i, line] of demo.lines.entries()) {
		const n = String(i + 1).padStart(2, '0');
		// Step the app's own clock until this line is final (it was "heard" as italic interim before).
		let half = false;
		for (let k = 0; (await finals()) < i + 1; k++) {
			if (k > 400) throw new Error(`line ${n} never landed`);
			await page.clock.runFor(100);
			if (!half && k * 100 > silentMs(line.text) / 2 && keep?.includes(`${n}h`)) { half = true; await still(page, `${prefix}_${n}h`); }
		}
		if (!keep || keep.includes(`${n}r`)) await still(page, `${prefix}_${n}r`); // instant on-device rules verdict
		// Advance through the 900 ms debounce until the real AI request goes out, then wait for it (real time).
		const sent0 = net.sent, done0 = net.done.length;
		for (let k = 0; net.sent === sent0 && k < 30; k++) await page.clock.runFor(100);
		const t1 = Date.now();
		while (net.done.length === done0 && Date.now() - t1 < 60000) await page.waitForTimeout(100);
		const r = net.done.at(-1);
		const body = r && net.done.length > done0 ? await r.json().catch(() => null) : null;
		log.push({line: i + 1, status: r?.status() ?? 'no response in 60s', ms: Date.now() - t1, ai: body && {score: body.score, level: body.level, flags: body.flags?.map((f) => f.id), sayThis: body.sayThis}});
		console.log('  ai', i + 1, log.at(-1).status, log.at(-1).ms + 'ms', body?.score, body?.level);
		await page.waitForTimeout(400);
		if (!keep || keep.includes(`${n}a`)) await still(page, `${prefix}_${n}a`);
	}
	await page.clock.runFor(2000);
	await still(page, `${prefix}_end`);
	fs.writeFileSync(path.join(TEXT, `${prefix}_ai.json`), JSON.stringify(log, null, 1));
	await page.context().close();
}

const SEQ = {
	async home(b) {
		const p = await newPage(b, {scheme: 'light', tz: 'Asia/Kolkata'});
		await p.goto(BASE, {waitUntil: 'networkidle'});
		await still(p, 'home_light', {full: false});
		await p.context().close();
		const d = await newPage(b, {scheme: 'dark', tz: 'Asia/Kolkata'});
		await d.goto(BASE, {waitUntil: 'networkidle'});
		await still(d, 'home_dark', {full: false});
		await d.context().close();
	},
	async arrest(b) {
		await demoCall(b, {id: 'digital-arrest', prefix: 'da', scheme: 'dark', tz: 'Asia/Kolkata', keep: null});
	},
	async irs(b) {
		await demoCall(b, {id: 'irs', prefix: 'irs', scheme: 'dark', tz: 'America/New_York', keep: null});
	},
	async bank(b) {
		await demoCall(b, {id: 'legit-bank', prefix: 'bank', scheme: 'light', tz: 'Asia/Kolkata', keep: null});
	},
	async hindi(b) {
		await demoCall(b, {id: 'digital-arrest', prefix: 'hi', scheme: 'light', tz: 'Asia/Kolkata', lang: 'hi', keep: ['09a']});
	},
	async check(b) {
		const p = await newPage(b, {scheme: 'light', tz: 'Asia/Kolkata'});
		await p.goto(`${BASE}/check`, {waitUntil: 'networkidle'});
		await still(p, 'check_00');
		const sms = 'Dear consumer your electricity power will be disconnected tonight at 9.30 pm because your previous month bill was not updated. Please immediately contact our electricity officer 98XXXXXX10.';
		await p.locator('textarea').fill(sms);
		await still(p, 'check_01');
		const resp = p.waitForResponse((r) => r.url().endsWith('/api/analyze'), {timeout: 30000});
		const t0 = Date.now();
		await p.locator('button', {hasText: 'Check it'}).click();
		await p.waitForTimeout(250);
		await still(p, 'check_02'); // instant rules verdict while the AI double-checks
		const r = await resp;
		const ms = Date.now() - t0;
		await still(p, 'check_03');
		fs.writeFileSync(path.join(TEXT, 'check_ai.json'), JSON.stringify({status: r.status(), ms, ai: await r.json().catch(() => null)}, null, 1));
		await p.context().close();
	},
	async how(b) {
		const p = await newPage(b, {scheme: 'light', tz: 'Asia/Kolkata', phone: false});
		await p.goto(`${BASE}/how-it-works`, {waitUntil: 'networkidle'});
		await still(p, 'how_desk');
		await p.context().close();
	},
};

const browser = await chromium.launch({channel: 'chromium'});
for (const [name, fn] of Object.entries(SEQ)) {
	if (only && only !== name) continue;
	console.log('==', name);
	await fn(browser);
}
await browser.close();
