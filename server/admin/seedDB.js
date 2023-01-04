const db = require('../db');

const seedData = (db) => {
  return db.query(`
    COPY reviews
    FROM '/Volumes/JCM-HDD/Development/Projects/SDC/reviews-data/reviews.csv'
    DELIMITER ','
    CSV HEADER;
  `)
    .then(() => {
      return db.query(`
        COPY review_photos
        FROM '/Volumes/JCM-HDD/Development/Projects/SDC/reviews-data/reviews_photos.csv'
        DELIMITER ','
        CSV HEADER;
      `)
    })
    .then(() => {
      return db.query(`
        COPY characteristics
        FROM '/Volumes/JCM-HDD/Development/Projects/SDC/reviews-data/characteristics.csv'
        DELIMITER ','
        CSV HEADER;
      `)
    })
    .then(() => {
      return db.query(`
        COPY characteristic_reviews
        FROM '/Volumes/JCM-HDD/Development/Projects/SDC/reviews-data/characteristic_reviews.csv'
        DELIMITER ','
        CSV HEADER;
      `)
    })
    .then((res) => {
      console.log(res)
    })
    .catch(err => {
      console.log(err);
    });
};

seedData(db)