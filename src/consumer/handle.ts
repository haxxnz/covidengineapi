import { EachBatchPayload, EachMessagePayload, Message } from 'kafkajs';

type CovidMessage = {
  objectid: string
  data_date: string
  postcode: string
  new: number | null
  active: number | null
  rate: number | null
}

export async function handleSingeMessage({ topic, partition, message }: EachMessagePayload) {
  const messageValue: CovidMessage = JSON.parse(message?.value?.toString() || "")
  console.log({
    key: message.key.toString(),
    value: message?.value?.toString(),
    headers: message.headers,

  });
  throw new Error("Shit man"); // Throw error so that it doesn't commit offset
}
