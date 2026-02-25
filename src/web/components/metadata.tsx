import siteConfig from "../../../website.config.json";

export function Metadata() {
	return (
		<>
			<title>{siteConfig.name}</title>
			<meta name="description" content={siteConfig.description} />

			{/* Open Graph */}
			<meta property="og:title" content={siteConfig.name} />
			<meta property="og:description" content={siteConfig.description} />
			<meta property="og:image" content="./" />
			<meta property="og:url" content={siteConfig.url} />
			<meta property="og:type" content="website" />

			{/* Twitter */}
			<meta name="twitter:card" content="summary_card" />
			<meta name="twitter:site" content={siteConfig.url} />
			<meta name="twitter:title" content={siteConfig.name} />
			<meta name="twitter:description" content={siteConfig.description} />
			<meta name="twitter:image" content="./" />
		</>
	);
}
