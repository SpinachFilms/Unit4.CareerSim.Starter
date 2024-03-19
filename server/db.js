//CRUD
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgre://localhost/my_store_db');
const uuid = require('uuid');
const jwt= require('jsonwebtoken');
const JWT = process.env.JWT

//createTables
const createTables = async() => {
    const SQL = `
    DROP TABLE IF EXISTS carted_products;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    CREATE TABLE users(
        id UUID DEFAUT gen_random_uuid(),
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(225) NOT NULL,
        address VARCHAR(255),
        payment_info VARCHAR(16),
        is_admin BOOLEAN,
        PRIMARY KEY (id)
    );
    CREATE TABLE products(
        id UUID DEFAUT gen_random_uuid(),
        name VARCHAR(20) UNIQUE NOT NULL,
        inventory NUMERIC,
        price NUMERIC(7,5),
        currency TEXT,
        PRIMARY KEY (id)
    );
    CREATE TABLE carted_products(
        id UUID DEFAUT gen_random_uuid(),
        product_id REFERENCES products(id),
        user_id UUID REFERENCES users(id) NOT NULL,
        amount NUMERIC DEFAULT,
        CONSTRAINT unique_user_and_product_id UNIQUE (product_id, user_id),
        CONSTRAINT amount_less_than_inventory CHECK (amount <= products(inventory)),
        PRIMARY KEY (id)
    );

    
    `
}

//createUser
const createUser = async() => {
    
}
//createCartedProduct
const createCartedProduct = async() => {
    
}
//createProduct
const createProduct = async() => {
    
}



//createOrder (optional)



//readUser
const selectOrder = async() => {
    
}
//readProducts
const selectProducts = async() => {
    
}
//readCartedProducts
const selectCartedProducts = async() => {
    
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