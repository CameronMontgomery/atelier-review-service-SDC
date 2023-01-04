const db = require('../db');

const createIndexes = (db) => {
  return db.query(`
    CREATE INDEX IF NOT EXISTS reviews_product_index
      ON public.reviews USING btree
      (product_id ASC NULLS LAST)
      TABLESPACE pg_default;
  `)
  .then(() => {
  return db.query(`
    CREATE INDEX IF NOT EXISTS review_photos_product_index
      ON public.review_photos USING btree
      (review_id ASC NULLS LAST)
      TABLESPACE pg_default;
  `)
  })
  .then(() => {
  return db.query(`
    CREATE INDEX IF NOT EXISTS characteristics_product_index
      ON public.characteristics USING btree
      (product_id ASC NULLS LAST)
      TABLESPACE pg_default;
  `)
  })
  .then(() => {
  return db.query(`
    CREATE INDEX IF NOT EXISTS characteristics_reviews_characteristic_id_index
      ON public.characteristic_reviews USING btree
      (characteristic_id ASC NULLS LAST)
      TABLESPACE pg_default;
  `)
  })
  .then(() => {
  console.log('Table indexes created');
  })
  .catch(err => {
  console.log(err);
  })
  .finally(() => db.end())

};

createIndexes(db)