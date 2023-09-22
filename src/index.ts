import fetch from 'isomorphic-fetch';

export = async function deliver<T>(name: string): Promise<T> {
	const { localStorage, require } = globalThis as any;

	try {
		const loaded = require?.(name);

		if (loaded) {
			return loaded;
		}
	} catch {
		// ignore failure to require
	}

	try {
		const cached = localStorage?.getItem(name);

		if (cached) {
			await Function(cached)();

			return await deliver(name);
		}
	} catch {
		// ignore failure to get from localStorage
	}

	try {
		const url = new URL(name, 'https://deliver.nodesite.eu');
		const response = await fetch(url);
		const text = await response.text();

		localStorage?.setItem(name, text);

		Function(text)();
	} catch {
		// ignore failure to fetch
	}

	return await deliver(name);
};
