import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

import { firstMarkdownImage } from "./firstMarkdownImage";

const images = import.meta.glob<{ default: ImageMetadata }>(
	"/src/**/*.{png,jpg,jpeg,gif,webp,avif,svg}",
	{ eager: true },
);

export function getPostThumbnail(
	post: CollectionEntry<"post">,
): { src: ImageMetadata | string; alt: string } | undefined {
	const image = firstMarkdownImage(post.body, post.id.endsWith(".mdx"));
	if (!image) return undefined;

	if (/^(https?:\/\/|\/)/.test(image.src)) return image;

	const path = new URL(image.src, `https://content.local/src/content/post/${post.id}`).pathname;
	const asset = images[decodeURIComponent(path)]?.default;
	if (!asset) throw new Error(`Cannot resolve the first image in ${post.id}: ${image.src}`);
	return { src: asset, alt: image.alt };
}
