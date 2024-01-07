import open from "open";
import { Flow } from "./lib/flow";
import { z } from "zod";
import logger from "./lib/logger";
import emojis from './lib/emoji.json';

// The events are the custom events that you define in the flow.on() method.
const events = ["search"] as const;
type Events = (typeof events)[number];

const flow = new Flow<Events>("assets/npm.png");


flow.on("query", (params) => {

	let results: typeof emojis = []

	try {
		let [query] = z.array(z.string()).parse(params);

		if (query) {
			results = emojis.filter(emoji => {
				if (emoji.aliases.some(alias => alias.includes(query))) {
					return true
				}
				if (emoji.tags.some(alias => alias.includes(query))) {
					return true;
				}
			})
		}
	} catch (error) {
	}

	const result = results.map(r => {
		// transform emoji to something like 
		const flavor = 'img-apple-160';
		const code = r.emoji.codePointAt(0)?.toString(16);
		return {
			Title: r.description,
			Subtitle: r.category + " " + r.tags.join(" "),
			JsonRPCAction: {
				method: 'search',
				parameters: [r.emoji],
				dontHideAfterAction: false,
			},
			ContextData: [],
			IcoPath: `https://emoji.aranja.com/static/emoji-data/${flavor}/${code}.png`,
			Score: 0,
		};
	});

	return console.log(JSON.stringify({ result }));

});

flow.on("search", (params) => {
	logger.info('Search', params)
	const [emoji] = params
	if (emoji) {
		//  set system clipboard
		const { execSync } = require("child_process");
		execSync(`powershell -command "Set-Clipboard -Value \"${emoji}\""`);
	}
});

flow.run();
