# WP Livecraft

Edit your WordPress site the way you actually see it. Click on any text, image, or block right on the page, change it, and it saves. No admin screens, no back-and-forth.

## What it does

You know the loop: spot a typo on your site, click "Edit Post" in the admin bar, wait for the admin editor to load, find the paragraph, fix the typo, hit update, go back to the frontend to check. For one word.

WP Livecraft puts the block editor right on your page. You see your content exactly as visitors do, and you edit it right there. Same blocks, same toolbar, same WordPress you already know. Just in the right place.

## Highlights

- **Edit where you read.** Click any block on the page and start typing. Your theme styles are right there, no guessing how it'll look.
- **Auto-saves as you go.** Changes save automatically after you stop typing. There's also a manual save button when you want it.
- **Publish and unpublish with guardrails.** Confirmation dialogs before publishing or switching to draft, so you don't accidentally take something live (or pull it down).
- **Create new posts and pages without leaving the site.** Hit the "+" button, pick post or page, and start writing immediately.
- **Undo and redo.** Made a mistake? Cmd+Z (or Ctrl+Z) works just like you'd expect. Redo with Shift too.
- **Works with your theme.** The editor inherits your theme's typography, colors, and layout. What you edit is what visitors see.
- **Works with other plugins.** WooCommerce blocks, custom blocks, anything that registers with the block editor shows up automatically.
- **Tiny footprint.** ~16 KB of custom JavaScript on top of what WordPress already ships. No new frameworks, no bloat.

## Quick start

1. Clone into your `wp-content/plugins` directory:

   ```bash
   git clone https://github.com/tpaksu/wp-livecraft.git
   cd wp-livecraft
   npm install && npm run build
   ```

2. Activate in **WordPress Admin > Plugins**.

3. Visit any post or page on your site while logged in. You'll see a toolbar at the bottom right. Click **Edit Post** (or **Edit Page**) and start editing.

You can also jump straight into edit mode by adding `#wp-livecraft-edit` to any post URL.

## Requirements

- WordPress 6.4+
- PHP 7.4+

## Development

```bash
npm run start          # Watch mode with auto-rebuild
npm run build          # Production build
npm run lint           # Run all linters (JS, CSS, PHP)
```

## License

GPL-2.0-or-later
