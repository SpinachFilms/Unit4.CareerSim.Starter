//CRUD
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/my_store_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken');
const JWT = process.env.jwt || 'shhh';

//createTables
const createTables = async() => {
    const SQL = `
    DROP TABLE IF EXISTS carted_products;
    DROP TABLE IF EXISTS cart;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    CREATE TABLE users(
        id UUID DEFAULT gen_random_uuid(),
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(225) NOT NULL,
        address VARCHAR(255),
        payment_info VARCHAR(16),
        is_admin BOOLEAN DEFAULT false,
        PRIMARY KEY (id)
    );
    CREATE TABLE products(
        id UUID DEFAULT gen_random_uuid(),
        name VARCHAR(20) UNIQUE NOT NULL,
        inventory NUMERIC,
        available BOOLEAN NOT NULL,
        price NUMERIC(7,5),
        currency TEXT,
        PRIMARY KEY (id)
    );
    CREATE TABLE cart(
        id UUID DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        CONSTRAINT unique_user_and_product_id UNIQUE (product_id, user_id),
        PRIMARY KEY (id)
        );
    CREATE TABLE carted_products(
        id UUID DEFAULT gen_random_uuid(),
        cart_id UUID REFERENCES cart(id),
        product_id REFERENCES products(id),
        amount NUMERIC DEFAULT,
        CONSTRAINT unique_user_and_product_id UNIQUE (product_id, user_id),
        CONSTRAINT amount_less_than_inventory CHECK (amount <= products(inventory)),
        PRIMARY KEY (id)
    );

    
    `
}

//createUser
const createUser = async({ username, password }) => {
    const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
  `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
}

//createProduct
const createProduct = async({ name, inventory }) => {
    const SQL = `
    INSERT INTO products(id, name, inventory) VALUES($1, $2, $3) RETURNING *
  `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
}

//createCartedProduct
const createCartedProduct = async({ cart_id, product_id, amount, inventory }) => {
    const SQL =`
    INSERT INTO carted_products(id, cart_id, product_id, amount) VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), product_id, user_id, amount]);
    return response.rows[0];
}




//createOrder (optional)



//readUser
const selectOrder = async() => {
    const SQL = `
    SELECT * FROM carted_products WHERE amount !==0;
  `;
  const response = await client.query(SQL);
  return response.rows;
}
//readProducts
const selectProducts = async() => {
    const SQL = `
    SELECT * FROM products;
  `;
  const response = await client.query(SQL);
  return response.rows;
}
//readCartedProducts
const selectCartedProducts = async() => {
    const SQL = `
    SELECT * FROM carted_products where product_id = $3
  `;
  const response = await client.query(SQL, [product_id]);
  return response.rows;
}
//updateCartedProduct
const updateCartedProducts = async() => {
    
}
//updateUser
const updateUser = async() => {
    
}
//updateProducts
const updateProducts = async() => {
    
}
//deleteUser
const deleteUser = async() => {
    const SQL = `
    DELETE FROM users WHERE user_id=$1 AND id=$2
  `;
  await client.query(SQL, [user_id, id]);
}
//deleteProducts
const deleteProducts = async() => {
    
}
//deleteCartedProducts
const deleteCartedProducts = async() => {
    
}


//Table Design
/*----Products----
id (UUID)
name 
price
num_inventory

----Users----
id (UUID)
first_name
last_name 
address
credit_card_num
isAdmin   BOOLEAN

----Carted_Products----
id (UUID)
user_id (foreign key)
product_id (foreign key)
amount
constraint one_product UNIQUE  (user_id, product_id)
constraint valid_amount CHECK (amount >= product_inventory)

*/