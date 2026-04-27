# howthingsdostuff

One-page GitHub Pages site for **HowThingsDoStuff(TM)**, featuring a vertical YouTube video feed.

## Files

- `index.html` — complete one-page dark-mode site
- `CNAME` — custom domain for GitHub Pages (`howthingsdostuff.com`)

## Add videos

Open `index.html` and edit the `youtubeLinks` array near the bottom:

```js
const youtubeLinks = [
  "https://www.youtube.com/watch?v=VIDEO_ID",
  "https://youtu.be/VIDEO_ID"
];
```

The list is generated with JavaScript from those links. Each card uses YouTube's privacy-enhanced embed domain (`youtube-nocookie.com`) and loads the iframe only when clicked.
