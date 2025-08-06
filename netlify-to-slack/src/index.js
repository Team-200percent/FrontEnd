export default {
	async fetch(request) {
		const slackWebhookUrl = 'https://hooks.slack.com/services/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';

		const payload = {
			text: `🎷 세상에!! 새로운 배포 버전이 업데이트되었지 뭐야??!!\n🔗 https://likelionhackathon.netlify.app`,
		};

		const response = await fetch(slackWebhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		return new Response('OK');
	},
};
