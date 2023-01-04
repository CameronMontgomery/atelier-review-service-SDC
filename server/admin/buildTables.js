const db = require('../db');

const rebuildTables = (db) => {
  return db.query(`
    DROP TABLE IF EXISTS public.reviews CASCADE;
    CREATE TABLE IF NOT EXISTS public.reviews
    (
      review_id serial NOT NULL,
      product_id integer NOT NULL,
      rating integer,
      date bigint,
      summary character varying(500),
      body character varying(1000),
      recommend boolean,
      reported boolean,
      reviewer_name character varying(60),
      reviewer_email character varying(60),
      response character varying(1000),
      helpfulness integer,
      PRIMARY KEY (review_id)
    );`)
    .then(() => {
      return db.query(`
      DROP TABLE IF EXISTS public.review_photos;
      CREATE TABLE IF NOT EXISTS public.review_photos
      (
        review_photo_id serial NOT NULL,
        review_id integer NOT NULL,
        url character varying NOT NULL,
        PRIMARY KEY (review_photo_id)
      );`)
    })
    .then(() => {
      return db.query(`
      DROP TABLE IF EXISTS public.characteristics CASCADE;
      CREATE TABLE IF NOT EXISTS public.characteristics
      (
        characteristic_id serial NOT NULL,
        product_id integer NOT NULL,
        name character varying(30) NOT NULL,
        PRIMARY KEY (characteristic_id)
      );`)
    })
    .then(() => {
      return db.query(`
      DROP TABLE IF EXISTS public.characteristic_reviews;
      CREATE TABLE IF NOT EXISTS public.characteristic_reviews
      (
        characteristic_review_id serial NOT NULL,
        characteristic_id integer NOT NULL,
        review_id integer NOT NULL,
        value integer,
        PRIMARY KEY (characteristic_review_id)
      );`)
    })
    .then(() => {
      return db.query(`
      ALTER TABLE IF EXISTS public.review_photos
        ADD FOREIGN KEY (review_id)
        REFERENCES public.reviews (review_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID;
      `)
    })
    .then(() => {
      return db.query(`
      ALTER TABLE IF EXISTS public.characteristic_reviews
        ADD FOREIGN KEY (characteristic_id)
        REFERENCES public.characteristics (characteristic_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;
      `)
    })
    .then(() => {
      return db.query(`
      ALTER TABLE IF EXISTS public.characteristic_reviews
        ADD FOREIGN KEY (review_id)
        REFERENCES public.reviews (review_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID;
      `)
    })
    .then(() => {
      console.log('Table reset successful. No data copied. Run script, seed-db to populate tables');
    })
    .catch(err => {
      console.log(err);
    })
    .finally(() => db.end())
};

rebuildTables(db)