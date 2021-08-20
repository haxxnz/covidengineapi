import { Consumer } from 'kafkajs';

export async function runConsumer(covidConsumer: Consumer): Promise<void> {
  await covidConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        key: message.key.toString(),
        value: message?.value?.toString(),
        headers: message.headers,
      });
      throw new Error("Shit man"); // Throw error so that it doesn't commit offset
    },
  });
}