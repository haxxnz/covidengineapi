import { Kafka, SASLOptions } from 'kafkajs';

import { runConsumer } from './connection';

const kafkaConfig = { username: '7M2SM5KA554SODLD', password: '3y9gqYEpewpwHrMOMBK/xl1R1+yWqUNtc6nOaWmAOZOXPGA0V74eaDPL7N6j32jm' };
const sasl: SASLOptions | undefined = (kafkaConfig.username && kafkaConfig.password) ? { username: kafkaConfig.username, password: kafkaConfig.password, mechanism: 'plain' } : undefined;
const ssl = !!sasl;

// This creates a client instance that is configured to connect to the Kafka broker provided by
// the environment variable KAFKA_BOOTSTRAP_SERVER
const kafka = new Kafka({
  clientId: '1449-govhack-team',
  brokers: ['pkc-4vndj.australia-southeast1.gcp.confluent.cloud:9092'],
  ssl,
  retry: {
    retries: 100
  },
  sasl
});

// Lol 
const covidConsumer = kafka.consumer({
  groupId: 'govhack-covid_cases_postcode',
});

runConsumer(covidConsumer);

export {
  covidConsumer,
  kafka
};