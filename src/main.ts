import { Plugin } from "obsidian";
import { installNoticePatch, NoticeDomFilter } from "./notice-filter";
import { NoticeKeywordFilterSettingTab } from "./settings-tab";
import {
  normalizeSettings,
  type NoticeFilterSettings,
} from "./settings";

export default class NoticeKeywordFilterPlugin extends Plugin {
  settings: NoticeFilterSettings = normalizeSettings(null);
  private noticeDomFilter: NoticeDomFilter | null = null;

  async onload(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());
    this.addSettingTab(new NoticeKeywordFilterSettingTab(this));

    this.register(installNoticePatch(() => this.settings));

    this.noticeDomFilter = new NoticeDomFilter(() => this.settings);
    this.noticeDomFilter.start();
    this.register(() => this.noticeDomFilter?.stop());
  }

  async saveSettings(): Promise<void> {
    this.settings = normalizeSettings(this.settings);
    await this.saveData(this.settings);
    this.noticeDomFilter?.filterVisibleNotices();
  }
}
