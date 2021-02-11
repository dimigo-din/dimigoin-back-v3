import Slack from 'slack-node';
import config from '../config';

const slack = new Slack();
slack.setWebhook(config.slackWebhookUri);

export const sendSlackMessage = async (text: string, emoji?: string) => {
  slack.webhook({
    channel: '#백엔드-로그',
    username: 'Dimigoin Server',
    text,
    icon_emoji: emoji,
  }, () => {});
};
