# Notice Keyword Filter

Hide noisy Obsidian notices when their text contains a keyword you choose.

## Features

- Add and remove blocked keywords from the plugin settings.
- Case-insensitive substring matching.
- Temporarily disable filtering without losing the keyword list.
- Settings take effect immediately and persist across restarts.
- Works on desktop and mobile.

## Usage

1. Open **Settings → Community plugins** and enable **Notice Keyword Filter**.
2. Open the plugin's settings.
3. Enter a keyword and press **Enter** or select **Add**.
4. Use the trash button beside a keyword to remove it.

For example, the keyword `sync complete` hides any notice containing that phrase, regardless of capitalization.

## Privacy and security

The plugin runs entirely inside Obsidian. It does not make network requests, collect telemetry, or read note contents. Its only saved data is the enabled state and the keyword list configured by the user.

## Development

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

The production build creates `main.js`. To test locally, copy `main.js`, `manifest.json`, and `styles.css` into `<Vault>/.obsidian/plugins/notice-keyword-filter/`, reload Obsidian, and enable the plugin.

## 中文说明

这个插件会根据你在设置页添加的关键字，屏蔽包含这些关键字的 Obsidian 弹出通知。匹配不区分大小写；可以随时添加、删除关键字或暂时关闭过滤。

## License

[MIT](LICENSE)
