const reviews = require('./reviews')

module.exports = app => {
  app.use('/reviews', reviews)
}