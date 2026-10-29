// Rebrands a pristine VS Code source tree as Talkdedsec. Idempotent: safe to re-run after an upstream update.
// Usage (repo root): node tlk/rebrand.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const NAME = 'Talkdedsec';
const REPO = 'https://github.com/talkdedseccode/talkdedsec-editor';
const SITE = 'https://code.talkdedsec.com';
const YEAR = new Date().getFullYear();

const p = (...s) => path.join(root, ...s);
const read = f => fs.readFileSync(p(f), 'utf8');
const write = (f, s) => fs.writeFileSync(p(f), s);
const changed = [];

function patch(file, pairs) {
	const before = read(file);
	let s = before;
	for (const [from, to] of pairs) {
		if (!s.includes(from) && !s.includes(to)) {
			throw new Error(`${file}: pattern not found, upstream changed: ${from}`);
		}
		s = s.split(from).join(to);
	}
	if (s !== before) { write(file, s); changed.push(file); }
}

// 1. product.json — identity matches the shipped 1.130.0 build so the installer upgrades it in place
const product = JSON.parse(read('product.json'));
Object.assign(product, {
	nameShort: NAME,
	nameLong: NAME,
	applicationName: 'talkdedsec',
	dataFolderName: '.talkdedsec',
	sharedDataFolderName: '.talkdedsec-shared',
	win32MutexName: 'talkdedsec',
	win32DirName: NAME,
	win32NameVersion: NAME,
	win32RegValueName: NAME,
	win32x64AppId: '{{E25B7685-F287-45C9-AD75-F89B5B719951}',
	win32arm64AppId: '{{61F28CAD-F51D-4387-A90C-530AE9D7B2C6}',
	win32x64UserAppId: '{{650CD737-137F-4A90-A9F1-3611329F5D49}',
	win32arm64UserAppId: '{{D5CF55A8-5CF7-4A5D-8616-9CFFBCEE656A}',
	win32AppUserModelId: 'Talkdedsec.Editor',
	win32ShellNameShort: 'T&alkdedsec',
	win32TunnelServiceMutex: 'talkdedsec-tunnelservice',
	win32TunnelMutex: 'talkdedsec-tunnel',
	darwinBundleIdentifier: 'com.talkdedsec.editor',
	linuxIconName: 'talkdedsec',
	urlProtocol: 'talkdedsec',
	serverApplicationName: 'talkdedsec-server',
	serverDataFolderName: '.talkdedsec-server',
	tunnelApplicationName: 'talkdedsec-tunnel',
	licenseName: 'MIT',
	licenseUrl: `${REPO}/blob/main/LICENSE`,
	serverLicenseUrl: `${REPO}/blob/main/LICENSE`,
	reportIssueUrl: `${REPO}/issues/new`,
	documentationUrl: SITE,
	requestFeatureUrl: `${REPO}/discussions`,
	privacyStatementUrl: SITE,
});
const productJson = JSON.stringify(product, null, '\t') + '\n';
if (productJson !== read('product.json')) { write('product.json', productJson); changed.push('product.json'); }

// 2. package metadata
const pkg = JSON.parse(read('package.json'));
pkg.author = { name: NAME };
const pkgJson = JSON.stringify(pkg, null, 2) + '\n';
if (pkgJson !== read('package.json')) { write('package.json', pkgJson); changed.push('package.json'); }

// 3. exe resource strings (rcedit) and electron app metadata
const msCopyright = /Copyright \(C\) \d{4} Microsoft\. All rights reserved/g;
for (const f of ['build/lib/electron.ts', 'build/gulpfile.vscode.ts', 'build/gulpfile.reh.ts']) {
	const before = read(f);
	const s = before
		.replace(/(companyName: |'CompanyName': )'Microsoft Corporation'/g, `$1'${NAME}'`)
		.replace(msCopyright, `Copyright (C) ${YEAR} ${NAME}. All rights reserved`);
	if (s !== before) { write(f, s); changed.push(f); }
}

// 4. installer
patch('build/win32/code.iss', [
	['AppPublisher=Microsoft Corporation', `AppPublisher=${NAME}`],
	['AppPublisherURL=https://code.visualstudio.com/', `AppPublisherURL=${SITE}/`],
	['AppSupportURL=https://code.visualstudio.com/', `AppSupportURL=${REPO}/issues`],
	['AppUpdatesURL=https://code.visualstudio.com/', `AppUpdatesURL=${REPO}/releases`],
	['OutputBaseFilename=VSCodeSetup', 'OutputBaseFilename={#NameShort}Setup'],
	['install VS Code for all users in this system, download the System Installer instead from https://code.visualstudio.com.', `install ${NAME} for all users in this system, download the System Installer instead from ${SITE}.`],
]);
for (const f of fs.readdirSync(p('build/win32/i18n'))) {
	const file = `build/win32/i18n/${f}`;
	const before = read(file);
	const s = before.replace(/^(UpdatingVisualStudioCode=).*$/m, (_, k) => `${k}${updatingText(f)}`);
	if (s !== before) { write(file, s); changed.push(file); }
}
function updatingText(f) {
	return f === 'messages.tr.isl' ? `${NAME} güncelleniyor...` : `Updating ${NAME}...`;
}
patch('resources/win32/VisualElementsManifest.xml', [
	['BackgroundColor="#2D2D30"', 'BackgroundColor="#0B0B0C"'],
	['ShortDisplayName="Code - OSS"', `ShortDisplayName="${NAME}"`],
]);

// 5. icons, all derived from the classic eye logo (tlk/icons, produced by tlk/ikon-uret.ps1)
const icons = {
	'win32/code.ico': 'resources/win32/code.ico',
	'win32/code_70x70.png': 'resources/win32/code_70x70.png',
	'win32/code_150x150.png': 'resources/win32/code_150x150.png',
	'linux/code.png': 'resources/linux/code.png',
	'darwin/code.icns': 'resources/darwin/code.icns',
	'server/code-192.png': 'resources/server/code-192.png',
	'server/code-512.png': 'resources/server/code-512.png',
	'server/favicon.ico': 'resources/server/favicon.ico',
};
for (const s of [100, 125, 150, 175, 200, 225, 250]) {
	icons[`win32/inno-big-${s}.bmp`] = `resources/win32/inno-big-${s}.bmp`;
	icons[`win32/inno-small-${s}.bmp`] = `resources/win32/inno-small-${s}.bmp`;
}
const svg = fs.readFileSync(p('tlk/icons/svg/logo.svg'));
for (const f of [
	'src/vs/workbench/browser/media/code-icon.svg',
	'src/vs/workbench/browser/parts/editor/media/letterpress-dark.svg',
	'src/vs/workbench/browser/parts/editor/media/letterpress-light.svg',
	'src/vs/workbench/browser/parts/editor/media/letterpress-hcDark.svg',
	'src/vs/workbench/browser/parts/editor/media/letterpress-hcLight.svg',
	'src/vs/sessions/browser/media/vscode-icon.svg',
	'src/vs/sessions/browser/media/sessions-logo-dark.svg',
	'src/vs/sessions/browser/media/sessions-logo-light.svg',
	'src/vs/sessions/contrib/chat/browser/media/letterpress-sessions-dark.svg',
	'src/vs/sessions/contrib/chat/browser/media/letterpress-sessions-light.svg',
	'extensions/github-authentication/media/code-icon.svg',
]) {
	if (!fs.existsSync(p(f))) { throw new Error(`missing logo target, upstream moved it: ${f}`); }
	if (!svg.equals(fs.readFileSync(p(f)))) { fs.writeFileSync(p(f), svg); changed.push(f); }
}
for (const [from, to] of Object.entries(icons)) {
	const data = fs.readFileSync(p('tlk/icons', from));
	if (!fs.existsSync(p(to)) || !data.equals(fs.readFileSync(p(to)))) { fs.writeFileSync(p(to), data); changed.push(to); }
}

// 6. user-visible product name in UI strings. Only text inside quotes on non-comment lines is touched,
// so identifiers, the `vscode` API namespace, comments and copyright headers stay as they are.
const NAMES = [['Visual Studio Code', NAME], ['VS Code', NAME], ['Code - OSS', NAME]];
// Microsoft's bundled chat extension keeps its own prompts and snapshot tests untouched
const skipDir = /(^|[\\/])(test|tests|node_modules|fixtures|testWorkspace|out|copilot|vscode-test-resolver)([\\/]|$)/;
function* walk(dir) {
	for (const e of fs.readdirSync(p(dir), { withFileTypes: true })) {
		const rel = path.join(dir, e.name);
		if (e.isDirectory()) { if (!skipDir.test(rel)) { yield* walk(rel); } }
		else { yield rel; }
	}
}
function inQuotes(line, idx) {
	let q = null;
	for (let i = 0; i < idx; i++) {
		const c = line[i];
		if (c === '\\') { i++; continue; }
		if (q) { if (c === q) { q = null; } }
		else if (c === '\'' || c === '"' || c === '`') { q = c; }
	}
	return q !== null;
}
// These literals are compared against, describe the real VS Code, or select upstream-only assets
const keepUpstream = new Set([
	'src/vs/platform/agentHost/node/missionControl/missionControlHost.ts',
	'src/vs/workbench/api/node/loopbackServer.ts',
	'src/vs/workbench/services/themes/common/workbenchThemeService.ts',
	'src/vs/workbench/contrib/chat/common/model/objectMutationLog.ts',
	'extensions/terminal-suggest/src/completions/gh.ts',
	'extensions/terminal-suggest/src/completions/code-insiders.ts',
	'extensions/terminal-suggest/src/completions/code-tunnel-insiders.ts',
].map(f => path.normalize(f)));
const reviewed = [];
function rebrandStrings(file) {
	if (keepUpstream.has(path.normalize(file))) { return; }
	const lines = read(file).split('\n');
	let dirty = false;
	for (let i = 0; i < lines.length; i++) {
		const t = lines[i].trimStart();
		if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('import ')) { continue; }
		let line = lines[i];
		for (const [from, to] of NAMES) {
			let idx = line.indexOf(from);
			while (idx !== -1) {
				if (inQuotes(line, idx)) {
					line = line.slice(0, idx) + to + line.slice(idx + from.length);
					idx = line.indexOf(from, idx + to.length);
				} else {
					idx = line.indexOf(from, idx + from.length);
				}
			}
		}
		if (line !== lines[i]) {
			if (!/localize2?\(|l10n\.t\(|nls\.json$/.test(lines[i] + (file.endsWith('.json') ? 'nls.json' : ''))) { reviewed.push(`${file}:${i + 1}: ${lines[i].trim()}`); }
			lines[i] = line; dirty = true;
		}
	}
	if (dirty) { write(file, lines.join('\n')); changed.push(file); }
}
for (const f of walk('src')) {
	if (f.endsWith('.ts') && !/\.test\.ts$|\.d\.ts$/.test(f)) { rebrandStrings(f); }
}
for (const f of walk('extensions')) {
	if (/package\.nls\.json$/.test(f) || (/[\\/]src[\\/].*\.ts$/.test(f) && !/\.test\.ts$|\.d\.ts$/.test(f))) { rebrandStrings(f); }
}

console.log(`${changed.length} files changed`);
if (reviewed.length) {
	console.log(`\nNon-localized string literals rebranded (review these):`);
	for (const r of reviewed) { console.log('  ' + r); }
}
