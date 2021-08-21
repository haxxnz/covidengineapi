import { EachMessagePayload } from 'kafkajs';

import { upsertNewLocation } from '../db/covid_location'

export type CovidLocationMessage = {
  objectid: string;
  date: string;
  postcode: string;
  site: string;
  venue: string;
  geocoded_address: string;
  suburb: string;
  state?: any;
  x: number;
  y: number;
  times: string;
  alert: string;
  detail: string;
  status: string;
  alert_type: string;
  date_string: string;
};

export async function handleSingeMessage({ message }: EachMessagePayload) {
  const messageValue: CovidLocationMessage = JSON.parse(message?.value?.toString() || "");

  await upsertNewLocation(messageValue)

}
