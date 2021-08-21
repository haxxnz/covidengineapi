import { Kafka, SASLOptions } from 'kafkajs'
import { runConsumer } from './connection'
import Dotenv from 'dotenv'

Dotenv.config()
const { KAFKA_USERNAME, KAFKA_PASSWORD } = process.env

const kafkaConfig = {
  username: KAFKA_USERNAME,
  password: KAFKA_PASSWORD,
}
const sasl: SASLOptions | undefined =
  kafkaConfig.username && kafkaConfig.password
    ? {
        username: kafkaConfig.username,
        password: kafkaConfig.password,
        mechanism: 'plain',
      }
    : undefined
const ssl = !!sasl

// This creates a client instance that is configured to connect to the Kafka broker provided by
// the environment variable KAFKA_BOOTSTRAP_SERVER
const kafka = new Kafka({
  clientId: 'govhack-team-1449',
  brokers: ['pkc-4vndj.australia-southeast1.gcp.confluent.cloud:9092'],
  ssl,
  retry: {
    retries: 100,
  },
  sasl,
})

// Lol
const covidConsumer = kafka.consumer({
  groupId: 'govhack-team-1449',
})

runConsumer(covidConsumer)

export { covidConsumer, kafka }
