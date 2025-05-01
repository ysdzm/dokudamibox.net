import type { APIContext, InferGetStaticPropsType } from "astro";

import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site-config";
import { getFormattedDate } from "@/utils";
import { Resvg } from "@resvg/resvg-js";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

const fontFileRegular = await fetch(
	"https://cdn.jsdelivr.net/npm/@openfonts/noto-sans-jp_japanese@1.44.5/files/noto-sans-jp-japanese-500.woff",
);

// fontFileRegular から ArrayBuffer を取得
const fontRegularArrayBuffer = await fontFileRegular.arrayBuffer();

console.log(fontRegularArrayBuffer);

const ogOptions: SatoriOptions = {
	// debug: true,
	fonts: [
		{
			data: Buffer.from(fontRegularArrayBuffer),
			name: "NotoSansJP",
			style: "normal",
			weight: 500,
		},
	],
	height: 630,
	width: 1200,
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}/${mm}/${dd}`;
};

const markup = (title: string, pubDate: string, coverImageSrc: string, coverImageAlt: string) =>
	html`<div
		tw="flex flex-col w-full h-full bg-white text-[#1d1f21]"
		style="border: 32px solid #2bbc89; font-family: 'Noto Sans JP', sans-serif;"
	>
		<div tw="flex flex-col flex-1 w-full p-10 justify-center ">
			<h1 tw="text-6xl font-bold leading-snug text-black text-center mx-auto mt-40">${title}</h1>
			<img src="${coverImageSrc}" alt="${coverImageAlt}"/>
			<h3 tw="text-3xl mb-6 text-center mx-auto">${formatDate(pubDate)}</h3>
		</div>
		<div tw="flex items-center justify-between w-full p-10 text-xl">
			<div tw="flex items-center">
				<img
					src="https://pbs.twimg.com/profile_images/1692602187795554304/KOy7bS--_400x400.png"
					width="50"
					height="50"
					tw="object-cover rounded-full"
					alt="Dokudami"
				/>
				<h1 tw="text-4xl ml-5 font-semibold text-black">${siteConfig.title}</h1>
			</div>
		</div>
	</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

import fs from "fs/promises";

export async function GET(context: APIContext) {
	const { pubDate, title, coverImageSrc, coverImageAlt } = context.props as Props;

	let imageDataUrl: string;

	if (typeof coverImageSrc === "object" && "fsPath" in coverImageSrc && "format" in coverImageSrc) {
		// ローカルファイルとして処理
		const fsPath = (coverImageSrc.fsPath as string);
		const format = (coverImageSrc.format as string);
		const imageBuffer = await fs.readFile(fsPath); // ← fs.readFile() に string を渡す
		const base64 = imageBuffer.toString("base64");
		const mimeType = `image/${format}`;
		imageDataUrl = `data:${mimeType};base64,${base64}`;
	} else if (typeof coverImageSrc === "string" && coverImageSrc.startsWith("http")) {
		// 外部URLの場合そのまま使う
		imageDataUrl = coverImageSrc;
	} else {
		throw new Error("Invalid coverImageSrc: unsupported format or missing fsPath");
	}

	const postDate = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});
	const svg = await satori(markup(title, postDate, imageDataUrl, coverImageAlt), ogOptions);
	const png = new Resvg(svg).render().asPng();

	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}


export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.slug },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
				coverImageSrc: post.data.coverImage?.src ?? "", // 画像のsrc
				coverImageAlt: post.data.coverImage?.alt ?? "", // 画像のalt
			},
		}));
}
