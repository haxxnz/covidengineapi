import { EachBatchPayload, EachMessagePayload, Message } from 'kafkajs';

export async function handleSingeMessage({ topic, partition, message }: EachMessagePayload) {
  console.log({
    key: message.key.toString(),
    value: message?.value?.toString(),
    headers: message.headers,
  });
  throw new Error("Shit man"); // Throw error so that it doesn't commit offset
}

export async function handleBatchMessage(payload: EachBatchPayload) {
  throw new Error("Don not fucking commit message");  // Throw error so that it doesn't commit offset
}