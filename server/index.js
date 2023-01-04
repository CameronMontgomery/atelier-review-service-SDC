const app = require('./app')

const PORT = process.env.SERVER_PORT || 8000;

app.listen(PORT, () => {
  console.log(`review-service is listening on ${PORT}`);
});