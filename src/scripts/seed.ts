import provider from '../../provider.json'
import { db, VercelPoolClient } from '@vercel/postgres'

console.log(provider.data.length)

// create statement for the tables
// hospital table
const hospitals = provider.data.map((item) => {
  return {
    name: item.name,
    location: item.location,
    address: item.address,
    tier_id: item.tier_id,
    type_id: item.type_id,
    phone_number: item.phone_number,
    state: item.state.id,
    type: item.type.id,
    products: item.products,
  }
})

async function seedState(client) {
  try {
    // create state table
    const createStateTable = await client.sql`
      CREATE TABLE states (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `
    // insert into state table
    const insertStateTable = await Promise.all(
      uniqueState.map((eachState) => client.sql`
      INSERT INTO states (name)
      VALUES (${eachState.name})
    `)
    )

    return insertStateTable
  }
  catch (error) {
    console.log(error)
  }
}

async function seedProduct(client) {
  try {
    // create product table
    const createProductTable = await client.sql`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `
    // insert into product table
    const insertProductTable = await Promise.all(
      uniqueProduct.map((eachProduct) => client.sql`
      INSERT INTO products (name)
      VALUES (${eachProduct})
    `)
    )

    return insertProductTable
  }
  catch (error) {
    console.log(error)
  }
}

async function seedType(client) {
  try {
    // create type table
    const createTypeTable = await client.sql`
      CREATE TABLE types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `
    // insert into type table
    const insertTypeTable = await Promise.all(
      uniqueItems.map((eachType) => client.sql`
      INSERT INTO types (name)
      VALUES (${eachType.name})
    `)
    )

    return insertTypeTable
  }
  catch (error) {
    console.log(error)
  }
}

async function seedTier(client) {
  try {
    // create tier table
    const createTierTable = await client.sql`
      CREATE TABLE tiers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `
    // insert into tier table
    const insertTierTable = await Promise.all(
      uniqueTier.map((eachTier) => client.sql`
      INSERT INTO tiers (name)
      VALUES (${eachTier})
    `)
    )

    return insertTierTable
  }
  catch (error) {
    console.log(error)
  }
}

async function seedHospitals(client) {
  try {
    // create hospital table
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    const createHopitalTable = await client.sql`
    CREATE TABLE hospitals (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      address TEXT,
      tier_id INTEGER,
      type_id INTEGER,
      phone_number VARCHAR(255),
      state_id INTEGER,
      products JSONB
    );
  `
    // insert into hospital table
    const insertHospitalTable = await Promise.all(
      hospitals.map((eachHospital) => client.sql`
      INSERT INTO hospitals (name, location, address, tier_id, type_id, phone_number, state_id, products)
      VALUES (${eachHospital.name}, ${eachHospital.location}, ${eachHospital.address}, ${eachHospital.tier_id}, ${eachHospital.type_id}, ${eachHospital.phone_number}, ${eachHospital.state}, ${JSON.stringify(eachHospital.products)}::JSONB)
    `)
    )

    console.log('done inserting hospital')

  }
  catch (error) {
    console.log(error)
  }
}



// console.log(hospitals)

// products

// state

// type of hospital

// product table
const product = provider.data.map((item) => item.products)
const productSet = new Set(product.flat())
const uniqueProduct = Array.from(productSet).sort((a, b) => Number(a) - Number(b))

// console.log(uniqueProduct)

// create sql statement to insert into product table

// state table
const state = provider.data.map((item) => item.state)

const uniqueState = Array.from(
  new Map(state.map(item => [item.id + '-' + item.name, item])).values()
).sort((a, b) => a.id - b.id);

// console.log(uniqueState)
// create sql statement to insert into state table

// type of hospital
const type = provider.data.map((item) => item.type)

const uniqueItems = Array.from(
  new Map(type.map(item => [item.id + '-' + item.name, item])).values()
);

const tier = provider.data.map((item) => item.tier_id)

let tierSet = new Set(tier)

const uniqueTier = Array.from(tierSet).sort((a, b) => Number(a) - Number(b))
// console.log(uniqueTier)
// console.log(type)
// console.log(uniqueItems)
// create sql statement to insert into state table

async function seed() {
  console.log('seeding')
  const client = await db.connect()
  if (client) {
    console.log('connected')
  }

  // drop tables
  await dropTables(client)

  // await client.query('BEGIN')
  const state = await seedState(client)
  const products = await seedProduct(client)
  const types = await seedType(client)
  const tiers = await seedTier(client)
  await seedHospitals(client, state, products, types, tiers)
  // await client.query('COMMIT')
  console.log('DONE Seeding data')
  process.exit(0)
}

async function dropTables(client) {
  try {
    await client.sql`DROP TABLE IF EXISTS states`
    await client.sql`DROP TABLE IF EXISTS products`
    await client.sql`DROP TABLE IF EXISTS types`
    await client.sql`DROP TABLE IF EXISTS tiers`
    await client.sql`DROP TABLE IF EXISTS hospitals`
  }
  catch (error) {
    console.log(error)
  }
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await db.end()
  console.log('done')
})
