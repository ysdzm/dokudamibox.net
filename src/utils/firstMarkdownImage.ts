import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

interface Node {
	type: string;
	url?: string | undefined;
	alt?: string | null | undefined;
	identifier?: string | undefined;
	children?: Node[] | undefined;
}

export interface MarkdownImage {
	src: string;
	alt: string;
}

const markdown = unified().use(remarkParse);
const mdx = unified().use(remarkParse).use(remarkMdx);

function* walk(node: Node): Generator<Node> {
	yield node;
	for (const child of node.children ?? []) yield* walk(child);
}

/** Find the first real Markdown image, including reference-style images. */
export function firstMarkdownImage(body: string, isMdx = false): MarkdownImage | undefined {
	const nodes = [...walk((isMdx ? mdx : markdown).parse(body))];
	const definitions = new Map<string, string>();
	for (const node of nodes) {
		if (
			node.type === "definition" &&
			node.identifier &&
			node.url &&
			!definitions.has(node.identifier)
		) {
			definitions.set(node.identifier, node.url);
		}
	}

	for (const node of nodes) {
		const src =
			node.type === "image"
				? node.url
				: node.type === "imageReference" && node.identifier
					? definitions.get(node.identifier)
					: undefined;
		if (src) return { src, alt: node.alt ?? "" };
	}
	return undefined;
}
