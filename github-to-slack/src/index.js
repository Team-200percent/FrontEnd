export default {
	async fetch(request) {
		const body = await request.json();

		const ref = body.ref?.split('/').pop(); // refs/heads/develop → develop
		const pusher = body.pusher?.name || 'unknown';

		const commits = (body.commits || []).map((c) => `• ${c.message} (${c.author.name})`).join('\n') || 'No commits';

		const payload = {
			text: `🚀 *${pusher}* pushed to \`${ref}\`:\n${commits}`,
		};

		const slackWebhookUrl = 'https://hooks.slack.com/services/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';

		const response = await fetch(slackWebhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		return new Response('OK');
	},
};
