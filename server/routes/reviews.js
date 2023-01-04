const Router = require('express-promise-router')
const { getProductReviews, postReview, getAverageProductRatings, markHelpful, reportReview } = require('../controllers/reviews.js')

const router = new Router()


router.get('/', getProductReviews)

router.post('/', postReview)

router.get('/meta', getAverageProductRatings)

router.put('/:review_id/helpful', markHelpful)

router.put('/:review_id/report', reportReview)

// export our router to be mounted by the parent application
module.exports = router
