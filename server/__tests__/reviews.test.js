const request = require("supertest");
const app = require('../app')
const { end } = ('../db')

const testPayload = {
  "product_id": 66642,
  "rating": 5,
  "summary": "!!!What a great product!!!",
  "body": "Works and looks great",
  "recommend": true,
  "name": "TESTING",
  "email": "test@test.com",
  "photos":[ "https://images.unsplash.com/photo-1519857609704-61e751edba25?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80" ],
  "characteristics": {
    "222779": 5,
    "222780": 5,
    "222781": 3,
    "222782": 3
  }
}

describe('The review service routes', (end) => {
  test('It should respond to a GET request with product_id query to /reviews with products reviews', () => {
    request(app)
      .get('/reviews')
      .query({ product_id: 1 })
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(2)

        expect(response.body[0].review_id).toBe(1)
        expect(response.body[0].reviewer_name).toBe('funtime')
        end()
      })

  })
})

