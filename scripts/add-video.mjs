#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const INDEX_PATH = resolve(process.cwd(), "index.html");

const parseArgs = (argv) => {
  let link = null;
  let position = "top";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--position") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --position. Use top or bottom.");
      }
      position = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("--position=")) {
      position = arg.split("=")[1] ?? "";
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (link) {
      throw new Error("Only one YouTube link can be provided.");
    }
    link = arg;
  }

  if (!link) {
    throw new Error("Usage: node scripts/add-video.mjs <youtube-link> [--position top|bottom]");
  }

  if (position !== "top" && position !== "bottom") {
    throw new Error(`Invalid --position value: ${position}. Use top or bottom.`);
  }

  return { link, position };
};

const getVideoId = (input) => {
  const url = new URL(input);
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.replace("/", "");
  }
  if (url.hostname.includes("youtube.com")) {
    return url.searchParams.get("v");
  }
  return null;
};

const toCanonicalLink = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;

const fetchMetadata = async (link) => {
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", link);
  endpoint.searchParams.set("format", "json");

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`oEmbed failed with ${response.status}`);
  }

  const data = await response.json();
  return {
    title: data.title || "YouTube video",
    channel: data.author_name || "YouTube",
  };
};

const parseCatalog = (html) => {
  const match = html.match(/const videoCatalog = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error("Could not find `const videoCatalog = [...]` in index.html.");
  }
  return {
    raw: match[1],
    start: match.index,
    end: (match.index ?? 0) + match[0].length,
  };
};

const main = async () => {
  const { link: linkArg, position } = parseArgs(process.argv.slice(2));

  let videoId;
  try {
    videoId = getVideoId(linkArg);
  } catch {
    throw new Error("Invalid URL. Please pass a valid YouTube link.");
  }

  if (!videoId) {
    throw new Error("Could not extract YouTube video id from the provided link.");
  }

  const canonicalLink = toCanonicalLink(videoId);
  const meta = await fetchMetadata(canonicalLink);
  const html = await readFile(INDEX_PATH, "utf8");
  const catalogMatch = parseCatalog(html);
  const catalog = JSON.parse(catalogMatch.raw);

  const alreadyExists = catalog.some((video) => {
    try {
      return getVideoId(video.link) === videoId;
    } catch {
      return false;
    }
  });

  if (alreadyExists) {
    console.log(`Video already exists in catalog: ${canonicalLink}`);
    return;
  }

  const nextVideo = {
    link: canonicalLink,
    title: meta.title,
    channel: meta.channel,
  };

  if (position === "bottom") {
    catalog.push(nextVideo);
  } else {
    catalog.unshift(nextVideo);
  }

  const replacement = `const videoCatalog = ${JSON.stringify(catalog, null, 4)};`;
  const nextHtml = `${html.slice(0, catalogMatch.start)}${replacement}${html.slice(catalogMatch.end)}`;
  await writeFile(INDEX_PATH, nextHtml, "utf8");

  console.log(`Added video: ${meta.title} (${meta.channel})`);
  console.log(`Link: ${canonicalLink}`);
  console.log(`Position: ${position}`);
};

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
