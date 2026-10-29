/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { Color } from '../../../../base/common/color.js';
import { IColorTheme, IThemeService, IFileIconTheme, IProductIconTheme } from '../../../../platform/theme/common/themeService.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { isBoolean, isString } from '../../../../base/common/types.js';
import { IconContribution, IconDefinition } from '../../../../platform/theme/common/iconRegistry.js';
import { ColorScheme, ThemeTypeSelector } from '../../../../platform/theme/common/theme.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';

export const IWorkbenchThemeService = refineServiceDecorator<IThemeService, IWorkbenchThemeService>(IThemeService);

export const THEME_SCOPE_OPEN_PAREN = '[';
export const THEME_SCOPE_CLOSE_PAREN = ']';
export const THEME_SCOPE_WILDCARD = '*';

export const themeScopeRegex = /\[(.+?)\]/g;

export enum ThemeSettings {
	COLOR_THEME = 'workbench.colorTheme',
	FILE_ICON_THEME = 'workbench.iconTheme',
	PRODUCT_ICON_THEME = 'workbench.productIconTheme',
	COLOR_CUSTOMIZATIONS = 'workbench.colorCustomizations',
	TOKEN_COLOR_CUSTOMIZATIONS = 'editor.tokenColorCustomizations',
	SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS = 'editor.semanticTokenColorCustomizations',

	PREFERRED_DARK_THEME = 'workbench.preferredDarkColorTheme',
	PREFERRED_LIGHT_THEME = 'workbench.preferredLightColorTheme',
	PREFERRED_HC_DARK_THEME = 'workbench.preferredHighContrastColorTheme', /* id kept for compatibility reasons */
	PREFERRED_HC_LIGHT_THEME = 'workbench.preferredHighContrastLightColorTheme',
	DETECT_COLOR_SCHEME = 'window.autoDetectColorScheme',
	DETECT_HC = 'window.autoDetectHighContrast',

	SYSTEM_COLOR_THEME = 'window.systemColorTheme'
}

export namespace ThemeSettingDefaults {
	export const COLOR_THEME_DARK = 'Talkdedsec Dark';
	export const COLOR_THEME_LIGHT = 'Talkdedsec Light';
	export const COLOR_THEME_HC_DARK = 'Default High Contrast';
	export const COLOR_THEME_HC_LIGHT = 'Default High Contrast Light';

	export const FILE_ICON_THEME = 'vs-seti';
	export const PRODUCT_ICON_THEME = 'Default';
}

/**
 * Migrates legacy theme settings IDs to their current equivalents.
 * Theme IDs were simplified: "Default" prefix was removed from built-in themes,
 * and "Experimental" prefix was replaced when VS Code themes became GA.
 */
export function migrateThemeSettingsId(settingsId: string): string {
	switch (settingsId) {
		case 'Default Dark Modern': return 'Dark Modern';
		case 'Default Light Modern': return 'Light Modern';
		case 'Default Dark+': return 'Dark+';
		case 'Default Light+': return 'Light+';
		case 'Experimental Dark':
		case 'VS Code Dark':
			return ThemeSettingDefaults.COLOR_THEME_DARK;
		case 'Experimental Light':
		case 'VS Code Light':
			return ThemeSettingDefaults.COLOR_THEME_LIGHT;
	}
	return settingsId;
}

export const COLOR_THEME_DARK_INITIAL_COLORS = {
	'actionBar.toggledBackground': '#383a49',
	'activityBar.activeBorder': '#6E7681',
	'activityBar.background': '#0B0B0C',
	'activityBar.border': '#17181C',
	'activityBar.foreground': '#C9CDD4',
	'activityBar.inactiveForeground': '#3A3E45',
	'activityBarBadge.background': '#6E7681',
	'activityBarBadge.foreground': '#0B0B0C',
	'badge.background': '#1E2024',
	'badge.foreground': '#C9CDD4',
	'button.background': '#6E7681',
	'button.border': '#FFFFFF12',
	'button.foreground': '#0B0B0C',
	'button.hoverBackground': '#1E2024',
	'button.secondaryBackground': '#121316',
	'button.secondaryForeground': '#C9CDD4',
	'button.secondaryHoverBackground': '#3C3C3C',
	'chat.slashCommandBackground': '#26477866',
	'chat.slashCommandForeground': '#85B6FF',
	'chat.editedFileForeground': '#E2C08D',
	'checkbox.background': '#121316',
	'checkbox.border': '#25282D',
	'debugToolBar.background': '#181818',
	'descriptionForeground': '#5A5F67',
	'dropdown.background': '#121316',
	'dropdown.border': '#25282D',
	'dropdown.foreground': '#C9CDD4',
	'dropdown.listBackground': '#121316',
	'editor.background': '#0B0B0C',
	'editor.findMatchBackground': '#1E2024',
	'editor.foreground': '#C9CDD4',
	'editor.inactiveSelectionBackground': '#3A3D41',
	'editor.selectionHighlightBackground': '#1E2024',
	'editorGroup.border': '#17181C',
	'editorGroupHeader.tabsBackground': '#0B0B0C',
	'editorGroupHeader.tabsBorder': '#17181C',
	'editorGutter.addedBackground': '#7F9A7F',
	'editorGutter.deletedBackground': '#D97A7A',
	'editorGutter.modifiedBackground': '#8A9BB5',
	'editorIndentGuide.activeBackground1': '#3A3E45',
	'editorIndentGuide.background1': '#17181C',
	'editorLineNumber.activeForeground': '#6E7681',
	'editorLineNumber.foreground': '#3A3E45',
	'editorOverviewRuler.border': '#17181C',
	'editorWidget.background': '#121316',
	'errorForeground': '#D97A7A',
	'focusBorder': '#25282D',
	'foreground': '#A8ADB5',
	'icon.foreground': '#A8ADB5',
	'input.background': '#121316',
	'input.border': '#25282D',
	'input.foreground': '#C9CDD4',
	'input.placeholderForeground': '#5A5F67',
	'inputOption.activeBackground': '#2489DB82',
	'inputOption.activeBorder': '#6E7681',
	'keybindingLabel.foreground': '#CCCCCC',
	'list.activeSelectionIconForeground': '#FFF',
	'list.dropBackground': '#383B3D',
	'menu.background': '#121316',
	'menu.border': '#25282D',
	'menu.foreground': '#C9CDD4',
	'menu.selectionBackground': '#1E2024',
	'menu.separatorBackground': '#25282D',
	'notificationCenterHeader.background': '#0E0E10',
	'notificationCenterHeader.foreground': '#CCCCCC',
	'notifications.background': '#121316',
	'notifications.border': '#25282D',
	'notifications.foreground': '#C9CDD4',
	'panel.background': '#0E0E10',
	'panel.border': '#17181C',
	'panelInput.border': '#25282D',
	'panelTitle.activeBorder': '#6E7681',
	'panelTitle.activeForeground': '#C9CDD4',
	'panelTitle.inactiveForeground': '#5A5F67',
	'peekViewEditor.background': '#0E0E10',
	'peekViewEditor.matchHighlightBackground': '#BB800966',
	'peekViewResult.background': '#0E0E10',
	'peekViewResult.matchHighlightBackground': '#BB800966',
	'pickerGroup.border': '#25282D',
	'ports.iconRunningProcessForeground': '#369432',
	'progressBar.background': '#6E7681',
	'quickInput.background': '#121316',
	'quickInput.foreground': '#C9CDD4',
	'settings.dropdownBackground': '#313131',
	'settings.dropdownBorder': '#3C3C3C',
	'settings.headerForeground': '#FFFFFF',
	'settings.modifiedItemIndicator': '#BB800966',
	'sideBar.background': '#0E0E10',
	'sideBar.border': '#17181C',
	'sideBar.foreground': '#A8ADB5',
	'sideBarSectionHeader.background': '#0E0E10',
	'sideBarSectionHeader.border': '#17181C',
	'sideBarSectionHeader.foreground': '#A8ADB5',
	'sideBarTitle.foreground': '#5A5F67',
	'statusBar.background': '#0E0E10',
	'statusBar.border': '#17181C',
	'statusBar.debuggingBackground': '#6E7681',
	'statusBar.debuggingForeground': '#0B0B0C',
	'statusBar.focusBorder': '#0078D4',
	'statusBar.foreground': '#5A5F67',
	'statusBar.noFolderBackground': '#0E0E10',
	'statusBarItem.focusBorder': '#0078D4',
	'statusBarItem.prominentBackground': '#1E2024',
	'statusBarItem.remoteBackground': '#1E2024',
	'statusBarItem.remoteForeground': '#C9CDD4',
	'tab.activeBackground': '#0B0B0C',
	'tab.activeBorder': '#1F1F1F',
	'tab.activeBorderTop': '#6E7681',
	'tab.activeForeground': '#C9CDD4',
	'tab.border': '#17181C',
	'tab.hoverBackground': '#121316',
	'tab.inactiveBackground': '#0E0E10',
	'tab.inactiveForeground': '#5A5F67',
	'tab.lastPinnedBorder': '#ccc3',
	'tab.selectedBackground': '#1E2024',
	'tab.selectedBorderTop': '#6caddf',
	'tab.selectedForeground': '#C9CDD4',
	'tab.unfocusedActiveBorder': '#1F1F1F',
	'tab.unfocusedActiveBorderTop': '#2B2B2B',
	'tab.unfocusedHoverBackground': '#1F1F1F',
	'terminal.foreground': '#C9CDD4',
	'terminal.inactiveSelectionBackground': '#3A3D41',
	'terminal.tab.activeBorder': '#0078D4',
	'textBlockQuote.background': '#0E0E10',
	'textBlockQuote.border': '#616161',
	'textCodeBlock.background': '#0E0E10',
	'textLink.activeForeground': '#C9CDD4',
	'textLink.foreground': '#6E7681',
	'textPreformat.background': '#3C3C3C',
	'textPreformat.foreground': '#A3B8A3',
	'textSeparator.foreground': '#21262D',
	'titleBar.activeBackground': '#0B0B0C',
	'titleBar.activeForeground': '#A8ADB5',
	'titleBar.border': '#17181C',
	'titleBar.inactiveBackground': '#0B0B0C',
	'titleBar.inactiveForeground': '#3A3E45',
	'welcomePage.progress.foreground': '#6E7681',
	'welcomePage.tileBackground': '#0E0E10',
	'widget.border': '#25282D'
};

export const COLOR_THEME_LIGHT_INITIAL_COLORS = {
	'actionBar.toggledBackground': '#dddddd',
	'activityBar.activeBorder': '#4A5563',
	'activityBar.background': '#FBFBFC',
	'activityBar.border': '#E2E4E9',
	'activityBar.foreground': '#26282D',
	'activityBar.inactiveForeground': '#A6ABB5',
	'activityBarBadge.background': '#4A5563',
	'activityBarBadge.foreground': '#FFFFFF',
	'badge.background': '#E6E8EC',
	'badge.foreground': '#26282D',
	'button.background': '#4A5563',
	'button.border': '#0000001a',
	'button.foreground': '#FFFFFF',
	'button.hoverBackground': '#E6E8EC',
	'button.secondaryBackground': '#FFFFFF',
	'button.secondaryForeground': '#26282D',
	'button.secondaryHoverBackground': '#CCCCCC',
	'chat.slashCommandBackground': '#ADCEFF7A',
	'chat.slashCommandForeground': '#26569E',
	'chat.editedFileForeground': '#895503',
	'checkbox.background': '#FFFFFF',
	'checkbox.border': '#D0D3DA',
	'descriptionForeground': '#7C818C',
	'diffEditor.unchangedRegionBackground': '#f8f8f8',
	'dropdown.background': '#FFFFFF',
	'dropdown.border': '#D0D3DA',
	'dropdown.foreground': '#26282D',
	'dropdown.listBackground': '#FFFFFF',
	'editor.background': '#FBFBFC',
	'editor.foreground': '#26282D',
	'editor.inactiveSelectionBackground': '#E5EBF1',
	'editor.selectionHighlightBackground': '#E6E8EC',
	'editorGroup.border': '#E2E4E9',
	'editorGroupHeader.tabsBackground': '#FBFBFC',
	'editorGroupHeader.tabsBorder': '#E2E4E9',
	'editorGutter.addedBackground': '#3F6B4F',
	'editorGutter.deletedBackground': '#B03A3A',
	'editorGutter.modifiedBackground': '#3B5A8C',
	'editorIndentGuide.activeBackground1': '#A6ABB5',
	'editorIndentGuide.background1': '#E2E4E9',
	'editorLineNumber.activeForeground': '#4A5563',
	'editorLineNumber.foreground': '#A6ABB5',
	'editorOverviewRuler.border': '#E2E4E9',
	'editorSuggestWidget.background': '#FFFFFF',
	'editorWidget.background': '#FFFFFF',
	'errorForeground': '#B03A3A',
	'focusBorder': '#D0D3DA',
	'foreground': '#4A4E57',
	'icon.foreground': '#4A4E57',
	'input.background': '#FFFFFF',
	'input.border': '#D0D3DA',
	'input.foreground': '#26282D',
	'input.placeholderForeground': '#7C818C',
	'inputOption.activeBackground': '#BED6ED',
	'inputOption.activeBorder': '#4A5563',
	'inputOption.activeForeground': '#000000',
	'keybindingLabel.foreground': '#3B3B3B',
	'list.activeSelectionBackground': '#E6E8EC',
	'list.activeSelectionForeground': '#26282D',
	'list.activeSelectionIconForeground': '#000000',
	'list.focusAndSelectionOutline': '#005FB8',
	'list.hoverBackground': '#FFFFFF',
	'menu.border': '#D0D3DA',
	'menu.selectionBackground': '#E6E8EC',
	'menu.selectionForeground': '#ffffff',
	'notebook.cellBorderColor': '#E5E5E5',
	'notebook.selectedCellBackground': '#C8DDF150',
	'notificationCenterHeader.background': '#F3F4F6',
	'notificationCenterHeader.foreground': '#3B3B3B',
	'notifications.background': '#FFFFFF',
	'notifications.border': '#D0D3DA',
	'notifications.foreground': '#26282D',
	'panel.background': '#F3F4F6',
	'panel.border': '#E2E4E9',
	'panelInput.border': '#D0D3DA',
	'panelTitle.activeBorder': '#4A5563',
	'panelTitle.activeForeground': '#26282D',
	'panelTitle.inactiveForeground': '#7C818C',
	'peekViewEditor.matchHighlightBackground': '#BB800966',
	'peekViewResult.background': '#F3F4F6',
	'peekViewResult.matchHighlightBackground': '#BB800966',
	'pickerGroup.border': '#D0D3DA',
	'pickerGroup.foreground': '#4A5563',
	'ports.iconRunningProcessForeground': '#369432',
	'progressBar.background': '#4A5563',
	'quickInput.background': '#FFFFFF',
	'quickInput.foreground': '#26282D',
	'searchEditor.textInputBorder': '#CECECE',
	'settings.dropdownBackground': '#FFFFFF',
	'settings.dropdownBorder': '#CECECE',
	'settings.headerForeground': '#1F1F1F',
	'settings.modifiedItemIndicator': '#BB800966',
	'settings.numberInputBorder': '#CECECE',
	'settings.textInputBorder': '#CECECE',
	'sideBar.background': '#F3F4F6',
	'sideBar.border': '#E2E4E9',
	'sideBar.foreground': '#4A4E57',
	'sideBarSectionHeader.background': '#F3F4F6',
	'sideBarSectionHeader.border': '#E2E4E9',
	'sideBarSectionHeader.foreground': '#4A4E57',
	'sideBarTitle.foreground': '#7C818C',
	'statusBar.background': '#F3F4F6',
	'statusBar.border': '#E2E4E9',
	'statusBar.debuggingBackground': '#4A5563',
	'statusBar.debuggingForeground': '#FFFFFF',
	'statusBar.focusBorder': '#005FB8',
	'statusBar.foreground': '#7C818C',
	'statusBar.noFolderBackground': '#F3F4F6',
	'statusBarItem.compactHoverBackground': '#CCCCCC',
	'statusBarItem.errorBackground': '#C72E0F',
	'statusBarItem.focusBorder': '#005FB8',
	'statusBarItem.hoverBackground': '#E6E8EC',
	'statusBarItem.prominentBackground': '#E6E8EC',
	'statusBarItem.remoteBackground': '#E6E8EC',
	'statusBarItem.remoteForeground': '#26282D',
	'tab.activeBackground': '#FBFBFC',
	'tab.activeBorder': '#F8F8F8',
	'tab.activeBorderTop': '#4A5563',
	'tab.activeForeground': '#26282D',
	'tab.border': '#E2E4E9',
	'tab.hoverBackground': '#FFFFFF',
	'tab.inactiveBackground': '#F3F4F6',
	'tab.inactiveForeground': '#7C818C',
	'tab.lastPinnedBorder': '#D4D4D4',
	'tab.selectedBackground': '#E6E8EC',
	'tab.selectedBorderTop': '#68a3da',
	'tab.selectedForeground': '#26282D',
	'tab.unfocusedActiveBorder': '#F8F8F8',
	'tab.unfocusedActiveBorderTop': '#E5E5E5',
	'tab.unfocusedHoverBackground': '#F8F8F8',
	'terminal.foreground': '#26282D',
	'terminal.inactiveSelectionBackground': '#E5EBF1',
	'terminal.tab.activeBorder': '#005FB8',
	'terminalCursor.foreground': '#26282D',
	'textBlockQuote.background': '#F3F4F6',
	'textBlockQuote.border': '#E5E5E5',
	'textCodeBlock.background': '#F3F4F6',
	'textLink.activeForeground': '#26282D',
	'textLink.foreground': '#4A5563',
	'textPreformat.background': '#0000001F',
	'textPreformat.foreground': '#3F6B4F',
	'textSeparator.foreground': '#21262D',
	'titleBar.activeBackground': '#FBFBFC',
	'titleBar.activeForeground': '#4A4E57',
	'titleBar.border': '#E2E4E9',
	'titleBar.inactiveBackground': '#FBFBFC',
	'titleBar.inactiveForeground': '#A6ABB5',
	'welcomePage.tileBackground': '#F3F4F6',
	'widget.border': '#D0D3DA'
};

export interface IWorkbenchTheme {
	readonly id: string;
	readonly label: string;
	readonly extensionData?: ExtensionData;
	readonly description?: string;
	readonly settingsId: string | null;
}

export interface IWorkbenchColorTheme extends IWorkbenchTheme, IColorTheme {
	readonly settingsId: string;
	readonly tokenColors: ITextMateThemingRule[];
}

export interface IColorMap {
	[id: string]: Color;
}

export interface IWorkbenchFileIconTheme extends IWorkbenchTheme, IFileIconTheme {
}

export interface IWorkbenchProductIconTheme extends IWorkbenchTheme, IProductIconTheme {
	readonly settingsId: string;

	getIcon(icon: IconContribution): IconDefinition | undefined;
}

export type ThemeSettingTarget = ConfigurationTarget | undefined | 'auto' | 'preview';


export interface IWorkbenchThemeService extends IThemeService {
	readonly _serviceBrand: undefined;
	setColorTheme(themeId: string | undefined | IWorkbenchColorTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchColorTheme | null>;
	getColorTheme(): IWorkbenchColorTheme;
	/** Returns the selected theme and user customizations without window-local overlays. */
	getBaseColorTheme(): IWorkbenchColorTheme;
	getColorThemes(): Promise<IWorkbenchColorTheme[]>;
	getMarketplaceColorThemes(publisher: string, name: string, version: string): Promise<IWorkbenchColorTheme[]>;
	readonly onDidColorThemeChange: Event<IWorkbenchColorTheme>;

	/** Applies window-local colors computed from the base theme, without persisting them or changing the selected theme. */
	registerColorThemeOverlay(getColors: (theme: IWorkbenchColorTheme) => IColorMap): IDisposable;

	getPreferredColorScheme(): ColorScheme | undefined;

	setFileIconTheme(iconThemeId: string | undefined | IWorkbenchFileIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchFileIconTheme>;
	getFileIconTheme(): IWorkbenchFileIconTheme;
	getFileIconThemes(): Promise<IWorkbenchFileIconTheme[]>;
	getMarketplaceFileIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchFileIconTheme[]>;
	readonly onDidFileIconThemeChange: Event<IWorkbenchFileIconTheme>;

	setProductIconTheme(iconThemeId: string | undefined | IWorkbenchProductIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchProductIconTheme>;
	getProductIconTheme(): IWorkbenchProductIconTheme;
	getProductIconThemes(): Promise<IWorkbenchProductIconTheme[]>;
	getMarketplaceProductIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchProductIconTheme[]>;
	readonly onDidProductIconThemeChange: Event<IWorkbenchProductIconTheme>;
}

export interface IThemeScopedColorCustomizations {
	[colorId: string]: string;
}

export interface IColorCustomizations {
	[colorIdOrThemeScope: string]: IThemeScopedColorCustomizations | string;
}

export interface IThemeScopedTokenColorCustomizations {
	[groupId: string]: ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
	comments?: string | ITokenColorizationSetting;
	strings?: string | ITokenColorizationSetting;
	numbers?: string | ITokenColorizationSetting;
	keywords?: string | ITokenColorizationSetting;
	types?: string | ITokenColorizationSetting;
	functions?: string | ITokenColorizationSetting;
	variables?: string | ITokenColorizationSetting;
	textMateRules?: ITextMateThemingRule[];
	semanticHighlighting?: boolean; // deprecated, use ISemanticTokenColorCustomizations.enabled instead
}

export interface ITokenColorCustomizations {
	[groupIdOrThemeScope: string]: IThemeScopedTokenColorCustomizations | ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
	comments?: string | ITokenColorizationSetting;
	strings?: string | ITokenColorizationSetting;
	numbers?: string | ITokenColorizationSetting;
	keywords?: string | ITokenColorizationSetting;
	types?: string | ITokenColorizationSetting;
	functions?: string | ITokenColorizationSetting;
	variables?: string | ITokenColorizationSetting;
	textMateRules?: ITextMateThemingRule[];
	semanticHighlighting?: boolean; // deprecated, use ISemanticTokenColorCustomizations.enabled instead
}

export interface IThemeScopedSemanticTokenColorCustomizations {
	[styleRule: string]: ISemanticTokenRules | boolean | undefined;
	enabled?: boolean;
	rules?: ISemanticTokenRules;
}

export interface ISemanticTokenColorCustomizations {
	[styleRuleOrThemeScope: string]: IThemeScopedSemanticTokenColorCustomizations | ISemanticTokenRules | boolean | undefined;
	enabled?: boolean;
	rules?: ISemanticTokenRules;
}

export interface IThemeScopedExperimentalSemanticTokenColorCustomizations {
	[themeScope: string]: ISemanticTokenRules | undefined;
}

export interface IExperimentalSemanticTokenColorCustomizations {
	[styleRuleOrThemeScope: string]: IThemeScopedExperimentalSemanticTokenColorCustomizations | ISemanticTokenRules | undefined;
}

export type IThemeScopedCustomizations =
	IThemeScopedColorCustomizations
	| IThemeScopedTokenColorCustomizations
	| IThemeScopedExperimentalSemanticTokenColorCustomizations
	| IThemeScopedSemanticTokenColorCustomizations;

export type IThemeScopableCustomizations =
	IColorCustomizations
	| ITokenColorCustomizations
	| IExperimentalSemanticTokenColorCustomizations
	| ISemanticTokenColorCustomizations;

export interface ISemanticTokenRules {
	[selector: string]: string | ISemanticTokenColorizationSetting | undefined;
}

export interface ITextMateThemingRule {
	name?: string;
	scope?: string | string[];
	settings: ITokenColorizationSetting;
}

export interface ITokenColorizationSetting {
	foreground?: string;
	background?: string;
	fontStyle?: string; /* [italic|bold|underline|strikethrough] */
	fontFamily?: string;
	fontSize?: number;
	lineHeight?: number;
}

export interface ISemanticTokenColorizationSetting {
	foreground?: string;
	fontStyle?: string; /* [italic|bold|underline|strikethrough] */
	bold?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	italic?: boolean;
}

export interface ExtensionData {
	extensionId: string;
	extensionPublisher: string;
	extensionName: string;
	extensionIsBuiltin: boolean;
}

export namespace ExtensionData {
	export function toJSONObject(d: ExtensionData | undefined): any {
		return d && { _extensionId: d.extensionId, _extensionIsBuiltin: d.extensionIsBuiltin, _extensionName: d.extensionName, _extensionPublisher: d.extensionPublisher };
	}
	export function fromJSONObject(o: any): ExtensionData | undefined {
		if (o && isString(o._extensionId) && isBoolean(o._extensionIsBuiltin) && isString(o._extensionName) && isString(o._extensionPublisher)) {
			return { extensionId: o._extensionId, extensionIsBuiltin: o._extensionIsBuiltin, extensionName: o._extensionName, extensionPublisher: o._extensionPublisher };
		}
		return undefined;
	}
	export function fromName(publisher: string, name: string, isBuiltin = false): ExtensionData {
		return { extensionPublisher: publisher, extensionId: `${publisher}.${name}`, extensionName: name, extensionIsBuiltin: isBuiltin };
	}
}

export interface IThemeExtensionPoint {
	id: string;
	label?: string;
	description?: string;
	path: string;
	uiTheme?: ThemeTypeSelector;
	_watch: boolean; // unsupported options to watch location
}
