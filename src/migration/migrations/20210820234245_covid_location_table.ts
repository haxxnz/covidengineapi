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
    table.float('x').nullable() //shitty schema
    table.float('y').nullable() //shitty schema
    table.string('alert')
    table.string('times')
    table.string('detail').nullable()
    table.string('status').notNullable()
    table.string('alert_type')
    table.string('date_string')
    table.date('created_at')
    table.date('updated_at')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('covid_contact_locations')
}

