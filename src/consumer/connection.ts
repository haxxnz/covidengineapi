import { Consumer } from 'kafkajs';

import { handleSingeMessage, handleBatchMessage } from './handle';

export async function runConsumer(covidConsumer: Consumer): Promise<void> {
  await covidConsumer.connect();
  await covidConsumer.subscribe({ topic: 'govhack-covid_cases_postcode', fromBeginning: true });
  await covidConsumer.run({
    eachMessage: handleSingeMessage,
    eachBatch: handleBatchMessage,
  });
}
