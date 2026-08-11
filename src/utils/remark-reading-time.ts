import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export function remarkReadingTime() {
	// @ts-expect-error:next-line
	return function (tree, { data }) {
		const textOnPage = toString(tree);
		const normalizedText = textOnPage
			.replace(/\b(?:import|export)\s+[\s\S]*?;\s*/g, " ")
			.replace(/\s+/g, " ")
			.trim();
		const readingTime = getReadingTime(textOnPage);
		const excerpt =
			normalizedText.length > 160 ? `${normalizedText.slice(0, 159)}…` : normalizedText;
		data.astro.frontmatter.excerpt = excerpt;
		data.astro.frontmatter.minutesRead = readingTime.text;
	};
}
