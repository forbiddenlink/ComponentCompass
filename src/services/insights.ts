import { insightsClient } from '@algolia/client-insights';
import { getEnv } from '../lib/env';

const env = getEnv();
const appId = env.VITE_ALGOLIA_APP_ID;
const apiKey = env.VITE_ALGOLIA_SEARCH_API_KEY;

const INDEX_NAME = 'trace';

function getUserToken(): string {
  const STORAGE_KEY = 'trace-user-token';
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}

function getClient() {
  try {
    return insightsClient(appId, apiKey);
  } catch (error) {
    console.warn('Failed to initialize Algolia Insights client:', error);
    return null;
  }
}

export function trackMessageView(objectIDs: string[]): void {
  const client = getClient();
  if (!client || objectIDs.length === 0) return;

  client.pushEvents({
    events: [
      {
        eventType: 'view',
        eventName: 'Message Viewed',
        index: INDEX_NAME,
        objectIDs,
        userToken: getUserToken(),
      },
    ],
  }).catch(console.warn);
}

export function trackFeedback(messageId: string, helpful: boolean): void {
  const client = getClient();
  if (!client) return;

  client.pushEvents({
    events: [
      {
        eventType: 'conversion',
        eventName: helpful ? 'Message Helpful' : 'Message Not Helpful',
        index: INDEX_NAME,
        objectIDs: [messageId],
        userToken: getUserToken(),
      },
    ],
  }).catch(console.warn);
}

export function trackSuggestionClick(query: string, objectIDs: string[]): void {
  const client = getClient();
  if (!client) return;

  client.pushEvents({
    events: [
      {
        eventType: 'click',
        eventName: 'Suggestion Clicked',
        index: INDEX_NAME,
        objectIDs: objectIDs.length > 0 ? objectIDs : [query],
        userToken: getUserToken(),
      },
    ],
  }).catch(console.warn);
}

export function trackComponentCardClick(componentName: string): void {
  const client = getClient();
  if (!client) return;

  client.pushEvents({
    events: [
      {
        eventType: 'click',
        eventName: 'Component Card Clicked',
        index: INDEX_NAME,
        objectIDs: [componentName],
        userToken: getUserToken(),
      },
    ],
  }).catch(console.warn);
}
