/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('invoice', function(table) {
            table.increments('invoice_id').primary();
            table.date('invoice_date').notNullable();
            table.text('invoice_customer_name').notNullable();
            table.text('invoice_salesperson_name').notNullable();
            table.text('invoice_notes');
        })
        .createTable('product', function(table) {
            table.increments('product_id').primary();
            table.text('product_name').notNullable();
            table.text('product_picture');
            table.integer('product_stock').notNullable();
            table.integer('product_price').notNullable();
        })
        .createTable('product_invoice', function(table) {
            table.increments('product_invoice_id').primary();
            table.integer('invoice_id').unsigned().notNullable();
            table.integer('product_id').unsigned().notNullable();
            table.foreign('invoice_id')
                .references('invoice_id')
                .inTable('invoice')
                .onDelete('CASCADE')
                .onUpdate('CASCADE');
            table.foreign('product_id')
                .references('product_id')
                .inTable('product')
                .onDelete('CASCADE')
                .onUpdate('CASCADE');
    });
};  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('product_invoice')
        .dropTableIfExists('product')
        .dropTableIfExists('invoice');
};
