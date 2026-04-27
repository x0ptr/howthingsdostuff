# howthingsdostuff

One-page GitHub Pages site for **HowThingsDoStuff(TM)**, featuring a searchable YouTube video feed.

## Files

- `index.html` — complete one-page site (search + embeds + styles)
- `CNAME` — custom domain for GitHub Pages (`howthingsdostuff.com`)
- `scripts/add-video.mjs` — CLI script to fetch title/channel and insert video into `videoCatalog`

## Add videos

Use the script with a YouTube URL (defaults to top of the feed):

```bash
node scripts/add-video.mjs "https://youtu.be/VIDEO_ID"
```

To insert at the bottom instead:

```bash
node scripts/add-video.mjs "https://youtu.be/VIDEO_ID" --position bottom
```

The script fetches metadata from YouTube oEmbed and inserts a `{ link, title, channel }` entry into `videoCatalog` in `index.html` at `top` or `bottom`.

## Search

The top navigation includes a live search box. It filters by:

- video title
- channel
- full link
