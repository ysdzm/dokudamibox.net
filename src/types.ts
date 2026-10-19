export interface SiteConfig {
	author: string;
	description: string;
	lang: string;
	ogLocale: string;
	sortPostsByUpdatedDate: boolean;
	title: string;
}

export interface PaginationLink {
	srLabel?: string;
	text?: string;
	url: string;
}

export interface SiteMeta {
	articleDate?: string | undefined;
	description?: string;
	ogImage?: string | undefined;
	title: string;
}
