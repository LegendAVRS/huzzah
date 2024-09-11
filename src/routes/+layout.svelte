<script>
	import '../app.css';
</script>

<svelte:head>
	<title>Huzzah!</title>
	<meta property="og:title" content={"Huzzah!"} />
	<meta property="og:url" content="https://gigi-counter.web.app/" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://raw.githubusercontent.com/LegendAVRS/huzzah/main/static/embed.jpg" />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="theme-color" content="#F5D5AE" />
	<meta
		name="description"
		content={"A huzzah counter for sir Gonathan G, not much to say really"}
	/>
	<meta
		name="og:description"
		content={"A huzzah counter for sir Gonathan G, not much to say really"}
	/>
</svelte:head>

<slot />
