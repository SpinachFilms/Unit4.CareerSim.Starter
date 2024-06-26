const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgresql://spinach:1234@localhost:5433/career_sims_four');
const uuid = require('uuid');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const { result } = require('express');
const JWT = process.env.JWT || 'shhh';


const createTables = async () => {
  const SQL = `
      DROP TABLE IF EXISTS carted_products;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS products;
      CREATE TABLE users(
        id UUID DEFAULT gen_random_uuid(),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100),
        address VARCHAR(255),
        payment_info VARCHAR(16),
        is_admin BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (id)
      );
      CREATE TABLE products(
        id UUID DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        price INTEGER DEFAULT 0,
        description VARCHAR(255),
        inventory INTEGER DEFAULT 0,
        PRIMARY KEY (id)
      );
      CREATE TABLE carted_products(
        id UUID DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        qty INTEGER DEFAULT 1,
        CONSTRAINT unique_user_and_product_id UNIQUE (product_id, user_id),
        PRIMARY KEY (id)
      );
    `;
  await client.query(SQL);
};


const createUser = async ({ email, password, address, payment_info, is_admin }) => {
  const SQL = `
      INSERT INTO users(id, email, password, address, payment_info, is_admin) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
    `;
  const result = await client.query(SQL, [uuid.v4(), email, await bcrypt.hash(password, 5), address, payment_info, is_admin]);
  return result.rows[0];
};
const createCartedProducts = async ({ user_id, product_id, qty }) => {
  const SQL = `
    INSERT INTO carted_products( user_id, product_id, qty) VALUES($1, $2, $3) RETURNING *
  `;
  const result = await client.query(SQL, [user_id, product_id, qty ]);
  console.log(result)
  return result.rows[0];
};


const createProduct = async ({ name, price, description, inventory }) => {
  const SQL = `
    INSERT INTO products(id, name, price, description, inventory) VALUES($1, $2, $3, $4, $5) RETURNING *
  `;
  const result = await client.query(SQL, [uuid.v4(), name, price, description, inventory]);
  return result.rows[0];
};


const fetchUsers = async () => {
  const SQL = `
    SELECT * FROM users;
  `;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchProducts = async () => {
  const SQL = `
    SELECT * FROM products;
  `;
  const result = await client.query(SQL);
  return result.rows;
};


const fetchSingleProduct = async ({id}) => {
  const SQL = `
  SELECT * FROM products WHERE id=$1
  `;
  const result = await client.query(SQL, [id]);
  return result.rows[0];
};


const fetchCartedProducts = async ({ user_id }) => {
  const SQL = `
    SELECT * FROM carted_products WHERE user_id = $1
  `;
  const result = await client.query(SQL, [user_id]);
  return result.rows;
};


const fetchAllCartedProducts = async () => {
  const SQL = `
    SELECT * FROM carted_products
  `;
  const result = await client.query(SQL);
  return result.rows;
};


const updateUser = async ({ email, password, address, payment_info, is_admin, id }) => {
  const SQL = `
    UPDATE users
    SET email=$1, password=$2, address=$3, payment_info=$4, is_admin=$5
    WHERE id=$6
    RETURNING *
  `;
  const result = await client.query(SQL,[email, await bcrypt.hash(password, 5), address, payment_info, is_admin, id ]);
  return result.rows[0];
};

const updateProduct = async ({ name, price, description, inventory, id }) => {
  const SQL = `
    UPDATE products
    SET name=$1, price=$2, description=$3, inventory=$4
    WHERE id=$5
    RETURNING *
  `;
  const result = await client.query(SQL,[name, price, description, inventory, id]);
  console.log(result)
  return result.rows[0];
};

const updateCartedProducts = async ({ qty, product_id, user_id }) => {
  const SQL = `
    UPDATE carted_products
    SET qty=$1
    WHERE product_id=$2 AND user_id=$3
    RETURNING *
`;
const result = await client.query(SQL,[qty, product_id, user_id]);
return result.rows[0];
}

const deleteUser = async ({id}) => {
  const SQL = `
  DELETE FROM users WHERE id = $1
    `;
  await client.query(SQL, [id]);
};

const deleteProduct = async ({ id }) => {
  const SQL = `
  DELETE FROM products WHERE id = $1
`;
  await client.query(SQL, [id]);
};

const deleteCartedProduct = async ({ user_id, product_id }) => {
  const SQL = `
  DELETE FROM carted_products WHERE user_id=$1 AND product_id=$2
`;
  await client.query(SQL, [user_id, product_id]);
};


const authenticate = async ({ email, password }) => {
  const SQL = `
      SELECT id, password, email
      FROM users
      WHERE email = $1
    `;
  const result = await client.query(SQL, [email]);
  console.log(result)
  if (!result.rows.length || (await bcrypt.compare(password, result.rows[0].password)) === false) {
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  const token = await jwt.sign({ id: result.rows[0].id }, JWT);
  return { token: token };
};


const findUserWithToken = async (token) => {
  let id;
  console.log("insidefinduserwithtoken")
  console.log(token)
  try {
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
  } catch (ex) {
    const error = Error('not authorized1');
    error.status = 401;
    throw error;

  }
  const SQL = `
      SELECT id, email, is_admin FROM users WHERE id=$1;
    `;
  const result = await client.query(SQL, [id]);
  if (!result.rows.length) {
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  return result.rows[0];
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  createCartedProducts,
  updateUser,
  updateProduct,
  updateCartedProducts,
  deleteUser,
  deleteProduct,
  deleteCartedProduct,
  authenticate,
  findUserWithToken,
  fetchProducts,
  fetchUsers,
  fetchCartedProducts,
  fetchSingleProduct,
  fetchAllCartedProducts
};