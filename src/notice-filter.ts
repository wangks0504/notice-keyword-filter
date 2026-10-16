import { Notice } from "obsidian";
import type { NoticeFilterSettings } from "./settings";

type SettingsProvider = () => NoticeFilterSettings;

function messageToText(message: string | DocumentFragment): string {
  return typeof message === "string" ? message : (message.textContent ?? "");
}

export function shouldBlockNotice(
  message: string | DocumentFragment,
  settings: NoticeFilterSettings,
): boolean {
  if (!settings.enabled || settings.keywords.length === 0) return false;

  const text = messageToText(message).toLocaleLowerCase();
  return settings.keywords.some((keyword) =>
    text.includes(keyword.toLocaleLowerCase()),
  );
}

export function installNoticePatch(getSettings: SettingsProvider): () => void {
  const originalSetMessage = Notice.prototype.setMessage;
  let active = true;

  function filteredSetMessage(
    this: Notice,
    message: string | DocumentFragment,
  ): Notice {
    const result = originalSetMessage.call(this, message);
    if (active && shouldBlockNotice(message, getSettings())) this.hide();
    return result;
  }

  Notice.prototype.setMessage = filteredSetMessage;

  return () => {
    active = false;
    if (Notice.prototype.setMessage === filteredSetMessage) {
      Notice.prototype.setMessage = originalSetMessage;
    }
  };
}

export class NoticeDomFilter {
  private readonly observer: MutationObserver;

  constructor(private readonly getSettings: SettingsProvider) {
    this.observer = new MutationObserver((mutations) => {
      const notices = new Set<Element>();

      for (const mutation of mutations) {
        const targetElement =
          mutation.target instanceof Element
            ? mutation.target
            : mutation.target.parentElement;
        const closestNotice = targetElement?.closest(".notice");
        if (closestNotice) notices.add(closestNotice);

        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(".notice")) notices.add(node);
          node.querySelectorAll(".notice").forEach((notice) => notices.add(notice));
        }
      }

      notices.forEach((notice) => this.filterElement(notice));
    });
  }

  start(): void {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    this.filterVisibleNotices();
  }

  stop(): void {
    this.observer.disconnect();
  }

  filterVisibleNotices(): void {
    document
      .querySelectorAll(".notice")
      .forEach((notice) => this.filterElement(notice));
  }

  private filterElement(noticeElement: Element): void {
    const message = document.createDocumentFragment();
    message.append(noticeElement.textContent ?? "");
    if (shouldBlockNotice(message, this.getSettings())) noticeElement.remove();
  }
}
