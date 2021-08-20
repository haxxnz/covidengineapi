import { Consumer } from 'kafkajs';

export async function establishConsumerConnection(consumer: Consumer): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topic: 'govhack-covid_cases_postcode', fromBeginning: true });
}
