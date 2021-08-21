import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('covid_contact_locations', (table) => {
    table.string('objectid').primary()
    table.date('date')
    table.string('postcode')
    table.string('site')
    table.string('venue')
    table.string('geocoded_address')
    table.string('suburb').nullable()
    table.string('state').nullable()
    table.float('x').notNullable()
    table.float('y').notNullable()
    table.string('alert')
    table.string('alert_type')
    table.string('status').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('covid_contact_locations')
}

