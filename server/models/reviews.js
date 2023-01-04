const db = require('../db')

const getReviewByProduct = async (product_id, sort) => {
  try {
    let response = await db.query(`
      SELECT r.review_id, r.rating, r.summary, r.recommend, r.response, r.body,  TO_TIMESTAMP(r.date / 1000) AS date, r.reviewer_name, r.helpfulness,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rp.review_photo_id,
              'url', rp.url
        )) FILTER (WHERE rp.review_photo_id IS NOT NULL), '[]') AS photos
      FROM public.reviews r
        LEFT JOIN review_photos rp
        ON r.review_id = rp.review_id
      WHERE product_id = $1
      GROUP BY r.review_id;
    `, [product_id])
    if (!response.rowCount > 0) return 'No reviews for this product.'
    return response.rows
  } catch (err) {
    console.log('Error: Getting reviews failed', err.message)
  }
}

const postProductReview = async (reviewData) => {
  const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = reviewData;
  try {
    // Post review to reviews
    let { rows } = await db.query(`
      INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING review_id
    `, [product_id, rating, Date.now(), summary, body, recommend, false, name, email, null, 0])
    if (!(!!rows.length)) {
      throw new Error('Posting review failed');
    }
    const { review_id } = rows[0]

    // Post pictures to review_photos
    if (!!photos.length) {
      const photoResponses = [];
      await Promise.all(photos.map(async (url) => {
        let photoRes = await db.query('INSERT INTO review_photos(review_id, url) VALUES($1, $2)', [review_id, url]);
        photoResponses.push(photoRes);
      }))
      .then(() => {
        if (!(photos.length === photoResponses.length)) {
          throw new Error('Posting review photos failed');
        }
      })
    }

    // Post into characteristic_reviews
    let characteristicsIds = Object.keys(characteristics);
    const characteristicsResponses = []
    await Promise.all(characteristicsIds.map(async characteristicId => {
      let characteristicsResponse = await db.query('INSERT INTO characteristic_reviews(characteristic_id, review_id, value) VALUES($1, $2, $3)', [characteristicId, review_id, characteristics[characteristicId]]);
      characteristicsResponses.push(characteristicsResponse);
    }))
    .then(() => {
      if (!(characteristicsResponses.length === characteristicsIds.length)) {
        throw new Error('Posting characteristics failed');
      }
    })
  } catch (err) {
    console.log('Error: Posting review failed', err.message);
  }
}

const getRatingAndRecommended = async (product_id) => {
  try {
    let ratingResponse = await db.query(`
    SELECT json_build_object(
          'product_id', $1,
          'ratings', json_build_object(
            '1', p.one,
            '2', p.two,
            '3', p.three,
            '4', p.four,
            '5', p.five),
          'recommend', json_build_object(
            'True', p.true,
            'False', p.false)) AS rating
    FROM( SELECT
      COUNT(r.rating) FILTER (WHERE r.rating = '1') AS "one",
      COUNT(r.rating) FILTER (WHERE r.rating = '2') AS "two",
      COUNT(r.rating) FILTER (WHERE r.rating = '3')  AS "three",
      COUNT(r.rating) FILTER (WHERE r.rating = '4') AS "four",
      COUNT(r.rating) FILTER (WHERE r.rating = '5') AS "five",
      COUNT(r.recommend) FILTER (WHERE r.recommend IS TRUE) AS "true",
      COUNT(r.rating) FILTER (WHERE r.recommend IS NOT TRUE) AS "false"
    FROM reviews r
    WHERE product_id = $1) AS p;
    `, [product_id])
    return ratingResponse.rows[0]
  } catch (err) {
    console.log('Error: Getting characteristics failed', err.message)
  }
}

const getAvgCharacteristics = async (product_id) => {
  try {
    let characteristicResponse = await db.query(`
      SELECT json_build_object(
          CAST(char_object ->> 'name' AS CHARACTER VARYING), json_build_object(
            'id', CAST(co.char_object ->> 'id' AS INTEGER),
            'value', AVG(CAST(co.char_object ->> 'value' AS INTEGER))
          )
        ) AS rating_values
      FROM (SELECT json_build_object('id', p.characteristic_id, 'name', p.name, 'value', p.value) AS char_object
        FROM (SELECT cr.characteristic_id, cr.review_id, cr.value, c.name
            FROM characteristic_reviews cr
          INNER JOIN characteristics c
            ON cr.characteristic_id = c.characteristic_id
          WHERE c.product_id = $1
          ORDER BY cr.review_id) AS p) as co
      GROUP BY CAST((co.char_object ->> 'id') AS INTEGER), CAST((co.char_object ->> 'name') AS CHARACTER VARYING);
    `, [product_id]);
    return characteristicResponse.rows;
  } catch (err) {
    console.log('Error: Getting characteristics failed', err.message)
  }
}

const markReviewHelpful = async (review_id) => {
  try {
    return await db.query(`
      UPDATE reviews
        SET  helpfulness = helpfulness + 1
      WHERE review_id = $1;
    `, [review_id])
  } catch (err) {
    return err.message
  }
}

const reportById = async (review_id) => {
  try {
    return await db.query(`
      UPDATE reviews
        SET  reported = true
      WHERE review_id = $1;
    `, [review_id])
  } catch (err) {
    return err.message
  }
}

module.exports = {
  getReviewByProduct,
  postProductReview,
  getAvgCharacteristics,
  getRatingAndRecommended,
  markReviewHelpful,
  reportById
}