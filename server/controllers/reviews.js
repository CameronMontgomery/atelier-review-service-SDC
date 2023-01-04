const { getReviewByProduct, postProductReview, getAvgCharacteristics, getRatingAndRecommended, markReviewHelpful, reportById} = require('../models/reviews');

const getProductReviews = async (req, res) => {
  // Still need to include pagination either by offset/limit or with ordered keyset
  try {
    const { product_id, sort } = req.query;
    if (!product_id) return res.status(400).send('Error: invalid product_id provided');
    const response = await getReviewByProduct(product_id, sort);
    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }

}

const postReview = async (req, res) => {
  try {
    const reviewData = req.body;
    if (!reviewData) return res.status(400).send(Error('No data in response'));
    await postProductReview(reviewData);
    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
}

const getAverageProductRatings = async (req, res) => {
  const { product_id } = req.query
  const ratingsAndRecommended = await getRatingAndRecommended(product_id)
  const avgCharacteristics = await getAvgCharacteristics(product_id)
  const ratingsAndCharacteristics = avgCharacteristics.reduce((combined, current) => {
    return {...combined, ...current.rating_values};
  }, {...ratingsAndRecommended.rating});

  res.send(ratingsAndCharacteristics)
}

const markHelpful = async (req, res) => {
  try {
    const { review_id } = req.params
    await markReviewHelpful(review_id)
    res.sendStatus(204)
  } catch (err) {
    res.sendStatus(500)
  }
}

const reportReview = async (req, res) => {
  try {
    const { review_id } = req.params
    await reportById(review_id)
    res.sendStatus(204)
  } catch (err) {
    res.sendStatus(500)
  }
}

module.exports = {
  getProductReviews,
  postReview,
  getAverageProductRatings,
  markHelpful,
  reportReview
}