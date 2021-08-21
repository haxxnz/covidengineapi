import { Consumer } from 'kafkajs';

import { handleSingeMessage } from './handle';

export async function runConsumer(covidConsumer: Consumer): Promise<void> {
  await covidConsumer.connect();
  await covidConsumer.subscribe({ topic: 'govhack-covid_contact_locations', fromBeginning: true });
  await covidConsumer.run({
    eachMessage: handleSingeMessage,
  });
}
