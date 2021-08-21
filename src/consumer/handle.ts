import { EachMessagePayload } from 'kafkajs';

// import { writeFileSync, readFileSync } from 'fs'

type CovidMessage = {
  objectid: string
  data_date: string
  postcode: string
  new: number | null
  active: number | null
  rate: number | null
}

export async function handleSingeMessage({ message }: EachMessagePayload) {
  const messageValue: CovidMessage = JSON.parse(message?.value?.toString() || "")
  console.log({
    key: message.key.toString(),
    value: message?.value?.toString(),
    headers: message.headers,
  });

  // const file = JSON.parse(readFileSync('./location.json').toString())
  // const extraContent = [...file, messageValue]
  // writeFileSync('./location.json', Buffer.from(JSON.stringify(extraContent)))
}
