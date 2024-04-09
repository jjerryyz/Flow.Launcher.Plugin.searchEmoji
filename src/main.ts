import emojis from './lib/emoji.json';
import { Flow } from "./lib/flow";
import logger from "./lib/logger";
import { execSync } from "child_process";
import Fuse from 'fuse.js';

// The events are the custom events that you define in the flow.on() method.
const events = ["search"] as const;
type Events = (typeof events)[number];

const flow = new Flow<Events>();

const fuze = new Fuse(emojis, { keys: ['description', { name: 'tags', weight: 2 }, { name: 'aliases', weight: 2 }] })

flow.on("query", (params = []) => {

	const [query] = params as string[];


	if (!query) {
		return flow.showInputHint();
	}

	const result = fuze.search(query).map(({ item: r }) => {
		// transform emoji to something like 

		// img-twitter-72
		// img-facebook-96
		// img-messenger-128
		// const flavor = 'img-google-136';
		const flavor = 'img-apple-160';
		const { emoji, variant='' } = r;
		const code = emoji.codePointAt(0)?.toString(16);
		const iconUrl =  `https://emoji.aranja.com/static/emoji-data/${flavor}/${code}${variant}.png`

		return {
			Title: r.description + " " + emoji,
			Subtitle: r.category + " " + r.tags.join(" "),
			JsonRPCAction: {
				method: 'search',
				parameters: [r.emoji],
				dontHideAfterAction: false,
			},
			ContextData: [],
			IcoPath: iconUrl,
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
		execSync(`powershell -command "Set-Clipboard -Value \"${emoji}\""`);
	}
});

flow.run();
