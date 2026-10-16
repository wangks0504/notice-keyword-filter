import { Notice, PluginSettingTab, Setting } from "obsidian";
import type NoticeKeywordFilterPlugin from "./main";
import { normalizeKeyword } from "./settings";

export class NoticeKeywordFilterSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: NoticeKeywordFilterPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Enable notice filtering")
      .setDesc("Keep the keyword list but stop filtering when disabled.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
          this.plugin.settings.enabled = value;
          await this.plugin.saveSettings();
        }),
      );

    let pendingKeyword = "";
    const addSetting = new Setting(containerEl)
      .setName("Blocked keywords")
      .setDesc(
        "A notice is hidden when its text contains any keyword. Matching is case-insensitive.",
      )
      .addText((text) => {
        text.setPlaceholder("For example: sync complete").onChange((value) => {
          pendingKeyword = value;
        });
        text.inputEl.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          void this.addKeyword(pendingKeyword);
        });
      });

    addSetting.addButton((button) =>
      button
        .setButtonText("Add")
        .setCta()
        .onClick(async () => this.addKeyword(pendingKeyword)),
    );

    const list = containerEl.createDiv({ cls: "notice-keyword-filter-list" });
    if (this.plugin.settings.keywords.length === 0) {
      list.createEl("p", {
        cls: "setting-item-description notice-keyword-filter-empty",
        text: "No blocked keywords yet.",
      });
      return;
    }

    for (const keyword of this.plugin.settings.keywords) {
      new Setting(list).setName(keyword).addButton((button) =>
        button
          .setIcon("trash-2")
          .setTooltip(`Delete “${keyword}”`)
          .onClick(async () => {
            this.plugin.settings.keywords = this.plugin.settings.keywords.filter(
              (item) => item !== keyword,
            );
            await this.plugin.saveSettings();
            this.display();
          }),
      );
    }
  }

  private async addKeyword(value: string): Promise<void> {
    const keyword = normalizeKeyword(value);
    if (!keyword) {
      new Notice("Keyword cannot be empty");
      return;
    }

    const duplicate = this.plugin.settings.keywords.some(
      (item) => item.toLocaleLowerCase() === keyword.toLocaleLowerCase(),
    );
    if (duplicate) {
      new Notice("This keyword already exists");
      return;
    }

    this.plugin.settings.keywords.push(keyword);
    await this.plugin.saveSettings();
    this.display();
  }
}
