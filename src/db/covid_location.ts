import { dbPool } from './index';
import { CovidLocationMessage } from '../consumer/handle';

export async function upsertNewLocation(covidLocation: CovidLocationMessage) {
  return dbPool('covid_contact_locations').insert(covidLocation).onConflict().merge(covidLocation);
}
