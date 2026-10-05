import type { CollectionEntry } from "astro:content";

export interface RelatedPostGroup {
	tag: string;
	posts: CollectionEntry<"post">[];
}

/** Show the newest posts per tag, without repeating posts across groups. */
export function getRelatedPostGroups(
	post: CollectionEntry<"post">,
	posts: CollectionEntry<"post">[],
	limitPerTag = 3,
): RelatedPostGroup[] {
	const tags = [...new Set(post.data.tags)];
	const candidates = posts
		.filter((candidate) => candidate.slug !== post.slug && !candidate.data.draft)
		.sort(
			(a, b) =>
				b.data.publishDate.getTime() - a.data.publishDate.getTime() ||
				a.slug.localeCompare(b.slug),
		);

	// Keep topic tags before broad year tags without changing the original tag order.
	tags.sort((a, b) => Number(/^\d{4}$/.test(a)) - Number(/^\d{4}$/.test(b)));

	const shownSlugs = new Set<string>();
	return tags
		.map((tag) => {
			const relatedPosts = candidates
				.filter((candidate) => candidate.data.tags.includes(tag) && !shownSlugs.has(candidate.slug))
				.slice(0, Math.max(0, limitPerTag));

			for (const candidate of relatedPosts) shownSlugs.add(candidate.slug);
			return { tag, posts: relatedPosts };
		})
		.filter((group) => group.posts.length > 0);
}
