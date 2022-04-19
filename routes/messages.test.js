"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");


let u1Token;
let u2Token;
let message;

describe("Messages Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+1111111111",
    });

    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+2222222222",
    });

    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "test1 to test2 FIRST",
    });

    const u1User = { username: "test1" };
    const u2User = { username: "test2" };
    u1Token = jwt.sign(u1User, SECRET_KEY);
    u2Token = jwt.sign(u2User, SECRET_KEY);
    message = m1;
  });


  /** GET /:id - get detail of message */
  describe("GET /messages/:id", function () {
    test("Can get detail of a message", async function () {
      let response = await request(app)
        .get(`/messages/${message.id}`)
        .send({ _token: u1Token });

      // response.body.message.sent_at = new Date(response.body.message.sent_at)
      expect(response.body).toEqual({
        message: {
          id: message.id,
          body: message.body,
          sent_at: message.sent_at.toJSON(), //message.sent_at
          read_at: null,
          from_user: {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+1111111111"
          },
          to_user: {
            username: "test2",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+2222222222"
          }
        }
      });
    });
  });

  /** POST / - post a message */
  describe("POST /messages/", function () {
    test("Can post a message", async function () {
      let response = await request(app)
        .post("/messages/")
        .send({
          _token: u1Token,
          body: "Send a message from test1",
          to_username: "test2"
        });
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        message: expect.any(Number),
      })
    })
  })
})

afterAll(async function () {
	await db.end();
});