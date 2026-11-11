// QA: render stills at the start / middle / end of every scene (or explicit frames).
//   node scripts/stills.mjs            -> out/qa/<scene>_<pct>.jpg
//   node scripts/stills.mjs 1200 1500  -> out/qa/f1200.jpg ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const tl = JSON.parse(fs.readFileSync(path.join(root, 'src/timeline.json'), 'utf8'));
const jobs = process.argv.slice(2).length
	? process.argv.slice(2).map((f) => [`f${f}`, Number(f)])
	: tl.scenes.flatMap((s) => [0.2, 0.55, 0.9].map((p) => [`${s.id}_${Math.round(p * 100)}`, Math.round(s.from + s.dur * p)]));

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Film'});
fs.mkdirSync(path.join(root, 'out/qa'), {recursive: true});
for (const [name, frame] of jobs) {
	await renderStill({serveUrl, composition, frame, output: path.join(root, `out/qa/${name}.jpg`), imageFormat: 'jpeg', jpegQuality: 85});
	console.log(name, frame);
}
