# Atelier Review Service

## Table of Contents

1. [Description](#description)
2. [Technical Overview](#technical-overview)
3. [Usage](#usage)
4. [Requirements](#requirements)
5. [Install and Set-up Postgres](#installation-and-setup-of-postgres)
5. [Development Enviroment](#development)

## Description

Atelier e-commerce site review service part of 3 services required to run Atelier site. Complete redesign of existing backend after increase in traffic. Scalability, latency, and uptime were primary considerations. Service provides functionality for the product reviewing system consisting of reviews for 100,000+ products.

This is a copy of the service in the organizations repo located at: [Organization Repo](https://github.com/RFC2209-CapFalcon/review-service-cameron)

## Technical Overview

Service is built with Node.js, Express, and Postgres. Local testing was performed with Jest, Supertest, and Artillery. Service was deployed and integrated using AWS EC2 instances and used NGINX for load balencing and spreading over multiple regions.

## Usage
In order to run the project locally please read [Requirements](#requirements) section for instructions setting up a local .env and for installing dependencies. Find further instructions for setting up the project for development or production in the [Development](#development) and [Production](#production) sections.

## Requirements

Node.js - version 16.0+
Postgres - version 14+

## Installation and Setup of Postgres

If on MacOS, open up terminal and install `postgrsql` with `brew`
```
brew install postgresql
```
To start the database we can use `brew services`
```
brew services start postgresql
```
If at any time you need to stop `postgresql` you can run:
```
brew services stop postgresql
```

## Creating Postgres Role

As the default configuration of Postgres is, a user called postgres is made with full superadmin access to the entire PostgreSQL instance running on your OS.
```
$ sudo -u postgres psql
```
The above command gets you the psql command line interface in full admin mode.

Note: It is strongly recommended that you create a new role with login, createdb, and password
```
postgres=# CREATE ROLE <name> WITH LOGIN CREATEDB PASSWORD <'password'>;
```
In order to have COPY privileges (Needed to seed database) while still logged in as superuser
```
postgres=# GRANT pg_read_server_files TO <name>;
```

## Granting Permissions

It is possible that tables may not allow access to the user that you wish. One example is if the tables were created by a superuser. If you run into this you can grant permissions by logging into psql client in the terminal as a superuser. When logged in as a superuser you should see a postgres=#, # denotes superuser. Then run:
```
GRANT permission_type ON table_name | ALL TO role_name;
```
OR to include all tables in a schema
```
GRANT SELECT
ON ALL TABLES
IN SCHEMA "public"
TO user;
```
[] denote user inputted values, don't include the brackets.

Important permissions to have to import/export data are pg_read_server_files and pg_write_server_files

## Configuring .env

The service requires configuring environment variables to be configured. A example is provided in config.env you will need to provide the database user (with create database permissions), and password. The other variables are provided with default values for running on your local machine.

## Create Database

Example uses the default postgres superuser, it is recommended you use a different user with the noted permissions, see Creating Postgres Role for more info.

```
sudo -u <computer's username> createdb review_service -O <postgres username>
```

After creating the database, run:
```
npm run create-tables
```
This will create unpopulated databases tables

## Seed Database

It is important to not make the tables from a superuser account as it will lock other users from accessing the tables without express permissions.
```
npm run seed-db
```

## Fixing out of Sync Primary Key Sequence After Mass Import

Command to get the sequence name:

```sql
SELECT PG_GET_SERIAL_SEQUENCE('"Foo"', 'Foo_id');

```
The table name must be in double quotes, surrounded by single quotes.

### Validate, that the sequence is out-of-sync

```sql
SELECT CURRVAL(PG_GET_SERIAL_SEQUENCE('"Foo"', 'Foo_id')) AS "Current Value", MAX("Foo_id") AS "Max Value" FROM "Foo";

```
When the `Current Value` is less than `Max Value`, your sequence is out-of-sync.

### Correct Sequences

```sql
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"Foo"', 'Foo_id')),
	(SELECT (MAX("Foo_id") + 1) FROM "Foo"), FALSE);

```

## Creating Table Indexes

Indexes are necessary to ensure the system runs properly if indexes are not set expect increased response times of 99.5% and likely system crash at at any scale.
```
       table                      column
      --------                   ---------
      reviews                   product_id
    review_photos               product_id
 characteristic_reviews	     characteristic_id
    characteristics             product_id
```

## Installing Dependencies

From within the root directory:
> 1. Run ```npm install``` to install all required dependencies


## Development

### Local Testing

#### Load Testing with Artillery
There are test scripts in artillery/scripts which have been written to simulate a realistic user flow interacting with the service. The scripts go through different phases starting with 20 users per second over 1 min, then a ramp up from 20-100 users per second and finally a sustained load phase of 100 users per second for 5 mins.

To run:
```
npm run test-artillery
```

Output will be to the console. You can view artillery.io for more output options

