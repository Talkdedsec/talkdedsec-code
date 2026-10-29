// Talkdedsec feature layer on top of the rebranded tree: privacy defaults, Open VSX, slimmer build,
// themes, dark installer and the bundled Turkish UI. Idempotent: run after `node tlk/rebrand.mjs`.
// Usage (repo root): node tlk/ozellestir.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const p = (...s) => path.join(root, ...s);
const read = f => fs.readFileSync(p(f), 'utf8');
const changed = [];
const save = (f, before, after) => { if (after !== before) { fs.writeFileSync(p(f), after); changed.push(f); } };

// replaces `from` with `to`; already-applied is fine, neither present means upstream moved and we stop
function patch(file, pairs) {
	const before = read(file);
	let s = before;
	for (const [from, to] of pairs) {
		// when `to` extends `from`, `from` survives the edit, so "applied" means `to` is there; otherwise it means `from` is gone
		const applied = to.includes(from) ? s.includes(to) : !s.includes(from) && (to === '' || s.includes(to));
		if (applied) { continue; }
		if (!s.includes(from)) {
			throw new Error(`${file}: pattern not found, upstream changed:\n${from}`);
		}
		s = s.split(from).join(to);
	}
	save(file, before, s);
}
function regex(file, re, to) {
	const before = read(file);
	if (!re.test(before)) { throw new Error(`${file}: ${re} not found, upstream changed`); }
	save(file, before, before.replace(re, to));
}

// ---- privacy -------------------------------------------------------------------------------------

patch('src/vs/platform/telemetry/common/telemetryService.ts', [
	[`'default': TelemetryConfiguration.ON,`, `'default': TelemetryConfiguration.OFF,`],
]);
patch('src/vs/workbench/services/assignment/common/assignmentService.ts', [
	[`"Fetches experiments to run from a Microsoft online service."),\n\t\t\t'default': true,`,
		`"Fetches experiments to run from a Microsoft online service."),\n\t\t\t'default': false,`],
]);
regex('extensions/json-language-features/package.json', /("json\.schemaDownload\.enable": \{[^}]*?"default": )(true|false)/, '$1false');
regex('extensions/npm/package.json', /("npm\.fetchOnlinePackageInfo": \{[^}]*?"default": )(true|false)/, '$1false');
// the first-run onboarding is a GitHub Copilot sign-in ("may use your data"), and Copilot isn't shipped
patch('src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.contribution.ts', [
	[`'workbench.welcomePage.experimentalOnboarding': {\n\t\t\tscope: ConfigurationScope.APPLICATION,\n\t\t\ttype: 'boolean',\n\t\t\tdefault: true,`,
		`'workbench.welcomePage.experimentalOnboarding': {\n\t\t\tscope: ConfigurationScope.APPLICATION,\n\t\t\ttype: 'boolean',\n\t\t\tdefault: false,`],
]);
// the chat plugin marketplace list is fetched from raw.githubusercontent.com on its own
patch('src/vs/workbench/contrib/chat/browser/chat.shared.contribution.ts', [
	[`import { DEFAULT_PLUGIN_MARKETPLACE } from '../common/plugins/marketplaceReference.js';\n`, ''],
	['default: [DEFAULT_PLUGIN_MARKETPLACE],', 'default: [],'],
]);

const productBefore = read('product.json');
const product = JSON.parse(productBefore);
delete product.voiceWsUrl;
product.extensionsGallery = {
	serviceUrl: 'https://open-vsx.org/vscode/gallery',
	itemUrl: 'https://open-vsx.org/vscode/item',
	resourceUrlTemplate: 'https://open-vsx.org/vscode/asset/{publisher}/{name}/{version}/Microsoft.VisualStudio.Code.WebResources/{path}',
	controlUrl: '',
	recommendationsUrl: '',
	nlsBaseUrl: '',
	publisherUrl: '',
};

// ---- Microsoft's bundled chat extension stays out of install and build ---------------------------

patch('build/npm/dirs.ts', [
	[`\t'extensions/copilot',\n`, ''],
	[`\t'extensions/vscode-api-tests',\n\t'extensions/vscode-colorize-tests',\n\t'extensions/vscode-colorize-perf-tests',\n\t'extensions/vscode-test-resolver',\n`, ''],
]);
patch('build/gulpfile.extensions.ts', [
	[`\t'extensions/vscode-api-tests/tsconfig.json',\n\t'extensions/vscode-colorize-tests/tsconfig.json',\n\t'extensions/vscode-colorize-perf-tests/tsconfig.json',\n\t'extensions/vscode-test-resolver/tsconfig.json',\n`, ''],
]);
patch('build/gulpfile.vscode.ts', [
	[`\t\t\tcompileNonNativeExtensionsBuildTask,\n\t\t\tcompileCopilotExtensionBuildTask,\n`, `\t\t\tcompileNonNativeExtensionsBuildTask,\n`],
	[`'copilot');\n\t\tprepareBuiltInCopilotRipgrepShim(platform, arch, builtInCopilotExtensionDir, appNodeModulesDir);\n`,
		`'copilot');\n\t\tif (fs.existsSync(builtInCopilotExtensionDir)) {\n\t\t\tprepareBuiltInCopilotRipgrepShim(platform, arch, builtInCopilotExtensionDir, appNodeModulesDir);\n\t\t}\n`],
	// no CDN hosts our source maps, so shipping them is dead weight
	['const stripSourceMapsInPackagingTasks = isCI;', 'const stripSourceMapsInPackagingTasks = true;'],
	[`? ['**', '!**/*.{js,css}.map']`, `? ['**', '!**/*.map']`],
	[`depFilterPattern.push('!**/*.{js,css}.map');`, `depFilterPattern.push('!**/*.map');`],
]);

// ---- themes --------------------------------------------------------------------------------------

const THEMES = [
	['Talkdedsec Dark', 'talkdedsec_dark', 'vs-dark', 'dark'],
	['Talkdedsec Midnight', 'talkdedsec_midnight', 'vs-dark', 'dark'],
	['Talkdedsec Matrix', 'talkdedsec_matrix', 'vs-dark', 'dark'],
	['Talkdedsec Ember', 'talkdedsec_ember', 'vs-dark', 'dark'],
	['Talkdedsec Light', 'talkdedsec_light', 'vs', 'light'],
];
const themeJson = file => JSON.parse(fs.readFileSync(p('tlk/themes', `${file}.json`), 'utf8'));
const labelKey = id => `${id.replace(/ (\w)/g, (_, c) => c).replace(/^T/, 't')}ThemeLabel`;

for (const [, file] of THEMES) {
	const src = fs.readFileSync(p('tlk/themes', `${file}.json`));
	const dst = p('extensions/theme-defaults/themes', `${file}.json`);
	if (!fs.existsSync(dst) || !src.equals(fs.readFileSync(dst))) { fs.writeFileSync(dst, src); changed.push(dst); }
}
{
	const f = 'extensions/theme-defaults/package.json';
	const before = read(f);
	let s = before;
	if (!s.includes('"Talkdedsec Dark"')) {
		const entries = THEMES.map(([id, file, ui]) =>
			`      {\n        "id": "${id}",\n        "label": "%${labelKey(id)}%",\n        "uiTheme": "${ui}",\n        "path": "./themes/${file}.json"\n      },\n`).join('');
		if (!s.includes('"themes": [\n')) { throw new Error(`${f}: themes array not found`); }
		s = s.replace('"themes": [\n', `"themes": [\n${entries}`);
	}
	save(f, before, s);
}
{
	const f = 'extensions/theme-defaults/package.nls.json';
	const before = read(f);
	let s = before;
	if (!s.includes('talkdedsecDarkThemeLabel')) {
		s = s.replace(/^\{\n/, `{\n${THEMES.map(([id]) => `\t"${labelKey(id)}": "${id}",\n`).join('')}`);
	}
	save(f, before, s);
}
// default theme, and the colors painted before the theme file loads come from the theme itself
{
	const f = 'src/vs/workbench/services/themes/common/workbenchThemeService.ts';
	const before = read(f);
	let s = before
		.replace(/(export const COLOR_THEME_DARK = )'[^']*';/, `$1'Talkdedsec Dark';`)
		.replace(/(export const COLOR_THEME_LIGHT = )'[^']*';/, `$1'Talkdedsec Light';`);
	for (const [name, file] of [['COLOR_THEME_DARK_INITIAL_COLORS', 'talkdedsec_dark'], ['COLOR_THEME_LIGHT_INITIAL_COLORS', 'talkdedsec_light']]) {
		const colors = themeJson(file).colors;
		const start = s.indexOf(`export const ${name} = {`);
		const end = s.indexOf('\n};', start);
		if (start < 0 || end < 0) { throw new Error(`${f}: ${name} not found`); }
		const block = s.slice(start, end).replace(/'([^']+)': '#[0-9A-Fa-f]+'/g, (m, key) => colors[key] ? `'${key}': '${colors[key]}'` : m);
		s = s.slice(0, start) + block + s.slice(end);
	}
	save(f, before, s);
}
regex('src/vs/platform/theme/electron-main/themeMainServiceImpl.ts', /const DEFAULT_BG_LIGHT = '#[0-9A-Fa-f]+';/, `const DEFAULT_BG_LIGHT = '${themeJson('talkdedsec_light').colors['editor.background']}';`);
regex('src/vs/platform/theme/electron-main/themeMainServiceImpl.ts', /const DEFAULT_BG_DARK = '#[0-9A-Fa-f]+';/, `const DEFAULT_BG_DARK = '${themeJson('talkdedsec_dark').colors['editor.background']}';`);
product.onboardingThemes = [
	...THEMES.map(([id, , , type]) => ({ id: id.toLowerCase().replace(' ', '-'), label: id, themeId: id, type })),
	...product.onboardingThemes.filter(t => !t.themeId.startsWith('Talkdedsec') && !/ 2026$/.test(t.themeId)),
];
save('product.json', productBefore, JSON.stringify(product, null, '\t') + '\n');

// ---- dark installer ------------------------------------------------------------------------------

{
	const f = 'build/win32/code.iss';
	const before = read(f);
	const dark = fs.readFileSync(p('tlk/kurulum-koyu.pas'), 'utf8');
	save(f, before, before.includes('procedure TlkKarart(') ? before : before.replace(/\n*$/, '\n\n') + dark);
}
// progress bridge for the custom setup shell: it runs this installer silently with /TLKPROGRESS=<file>
patch('build/win32/code.iss', [
	[`procedure CurInstallProgressChanged(CurProgress, MaxProgress: Integer);\nvar\n  ProgressFilePath: String;\n  ProgressContent: String;\n  CurrentPct: Integer;\nbegin\n  if IsBackgroundUpdate() then begin\n`,
		`var\n  TlkLastPermille: Integer;\n\nprocedure CurInstallProgressChanged(CurProgress, MaxProgress: Integer);\nvar\n  ProgressFilePath: String;\n  ProgressContent: String;\n  CurrentPct: Integer;\n  TlkPermille: Integer;\nbegin\n  if (MaxProgress > 0) and (ExpandConstant('{param:TLKPROGRESS}') <> '') then begin\n    TlkPermille := Round(CurProgress * 1000.0 / MaxProgress);\n    if TlkPermille <> TlkLastPermille then begin\n      TlkLastPermille := TlkPermille;\n      SaveStringToFile(ExpandConstant('{param:TLKPROGRESS}'), IntToStr(TlkPermille), False);\n    end;\n  end;\n\n  if IsBackgroundUpdate() then begin\n`],
]);

// ---- Turkish UI ----------------------------------------------------------------------------------

// built-in packs are never "installed", so without this they never reach languagepacks.json
patch('src/vs/platform/languagePacks/node/languagePacks.ts', [
	[`\t\t\tpostUninstall: async (extension: ILocalExtension): Promise<void> => {\n\t\t\t\treturn this.postUninstallExtension(extension);\n\t\t\t}\n\t\t});\n\t}\n`,
		`\t\t\tpostUninstall: async (extension: ILocalExtension): Promise<void> => {\n\t\t\t\treturn this.postUninstallExtension(extension);\n\t\t\t}\n\t\t});\n\t\tthis.update().catch(error => this.logService.error(error));\n\t}\n`],
]);
// upstream only honours argv.json "locale" on Windows; a Turkish OS gets the Turkish UI without it
patch('src/mainImpl.ts', [
	['const userLocale = getUserDefinedLocale(argvConfig);\n',
		`const userLocale = getUserDefinedLocale(argvConfig) ?? (osLocale.startsWith('tr') ? 'tr' : undefined);\n`],
]);
// Chromium's spellchecker pulls Hunspell dictionaries from Google on first launch; no session gets to do that
patch('src/mainImpl.ts', [
	[`\tapp.commandLine.appendSwitch('lang', electronLocale);\n}\n\n// Load our code once ready`,
		`\tapp.commandLine.appendSwitch('lang', electronLocale);\n}\n\napp.on('session-created', session => {\n\tsession.setSpellCheckerEnabled(false);\n\tsession.setSpellCheckerDictionaryDownloadURL('http://127.0.0.1:9/');\n});\n\n// Load our code once ready`],
]);
// product name in the pack's translations, with Turkish suffixes re-harmonised ("VS Code'un" -> "Talkdedsec'in")
const SUFFIX = { u: 'i', un: 'in', nun: 'in', yu: 'i', a: 'e', ya: 'ye', da: 'te', ta: 'te', daki: 'teki', dan: 'ten', tan: 'ten', la: 'le', yla: 'le' };
function* jsonFiles(dir) {
	for (const e of fs.readdirSync(p(dir), { withFileTypes: true })) {
		const rel = path.join(dir, e.name);
		if (e.isDirectory()) { yield* jsonFiles(rel); } else if (e.name.endsWith('.json')) { yield rel; }
	}
}
for (const f of jsonFiles('extensions/vscode-language-pack-tr/translations')) {
	const before = read(f);
	const s = before.replace(/(?:Visual Studio Code|VS Code|Code - OSS)(?:'([a-zçğıöşü]+))?/g, (_, suf) =>
		suf === undefined ? 'Talkdedsec' : `Talkdedsec'${SUFFIX[suf] ?? suf}`);
	save(f, before, s);
}

// ---- repository files ----------------------------------------------------------------------------

// upstream's .github is Microsoft's CI, bots and agent setup; ours replaces it whole
function syncDir(src, dst) {
	const want = new Set();
	const walk = (rel = '') => {
		for (const e of fs.readdirSync(p(src, rel), { withFileTypes: true })) {
			const r = path.join(rel, e.name);
			if (e.isDirectory()) { walk(r); continue; }
			want.add(r);
			const from = fs.readFileSync(p(src, r)), to = p(dst, r);
			if (!fs.existsSync(to) || !from.equals(fs.readFileSync(to))) {
				fs.mkdirSync(path.dirname(to), { recursive: true });
				fs.writeFileSync(to, from);
				changed.push(path.join(dst, r));
			}
		}
	};
	walk();
	const prune = (rel = '') => {
		for (const e of fs.readdirSync(p(dst, rel), { withFileTypes: true })) {
			const r = path.join(rel, e.name);
			if (e.isDirectory()) {
				prune(r);
				if (fs.readdirSync(p(dst, r)).length === 0) { fs.rmdirSync(p(dst, r)); }
			} else if (!want.has(r)) {
				fs.rmSync(p(dst, r));
				changed.push(path.join(dst, r));
			}
		}
	};
	prune();
}
syncDir('tlk/repo/github', '.github');
for (const f of ['README.md', 'README.tr.md', 'SECURITY.md', 'CONTRIBUTING.md']) {
	const src = fs.readFileSync(p('tlk/repo', f));
	if (!fs.existsSync(p(f)) || !src.equals(fs.readFileSync(p(f)))) { fs.writeFileSync(p(f), src); changed.push(f); }
}
for (const f of ['AGENTS.md', '.agents']) {
	if (fs.existsSync(p(f))) { fs.rmSync(p(f), { recursive: true }); changed.push(f); }
}
// the agent-harness links point at the agent files removed above
regex('build/npm/postinstall.ts', /(\n\tfs\.writeFileSync\(stateContentsFile, JSON\.stringify\(computeContents\(\)\)\);\n)(\n\t\/\/ Symlink \.claude\/ files[\s\S]*?\.claude\/skills -> \.agents\/skills`\);\n\t\}\n)?/, '$1');
{
	const f = '.gitignore';
	const before = read(f);
	save(f, before, /^CLAUDE\.md$/m.test(before) ? before : before.replace(/\n*$/, '\n\n# local agent notes\nCLAUDE.md\n'));
}
{
	const f = 'LICENSE.txt';
	const before = read(f);
	save(f, before, before.includes('Talkdedsec') ? before : before.replace(/(Copyright \(c\) 2015 - present Microsoft Corporation)(\r?\n)/, `$1$2Copyright (c) ${new Date().getFullYear()} Talkdedsec$2`));
}

console.log(`${changed.length} files changed`);
