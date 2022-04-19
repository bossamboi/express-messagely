"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");
const { Test } = require("supertest");

let u1Token;
let u2Token;

describe("User Routes Test", function () {
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

		let m2 = await Message.create({
			from_username: "test1",
			to_username: "test2",
			body: "test1 to test2 SECOND",
		});

		const u1User = { username: "test1" };
		const u2User = { username: "test2" };
		u1Token = jwt.sign(u1User, SECRET_KEY);
		u2Token = jwt.sign(u2User, SECRET_KEY);
	});

	/** GET /users => gets list of users*/

	describe("GET users/", function () {
		test("can get all users", async function () {
			let response = await request(app).get("/users").send({ _token: u1Token });
			expect(response.body).toEqual({
				users: [
					{ username: "test1", first_name: "Test1", last_name: "Testy1" },
					{ username: "test2", first_name: "Test2", last_name: "Testy2" },
				],
			});
		});
		test("won't get users without proper token", async function () {
			let response = await request(app)
				.get("/users")
				.send({ _token: "dasfjweiafjdf" });
			expect(response.statusCode).toEqual(401);
		});
	});

	/** GET /users/:username => get one use*/

	describe("GET users/:username", function () {
		test("can get single user if correct user logged in", async function () {
			let response = await request(app)
				.get("/users/test1")
				.send({ _token: u1Token });

			response.body.user.join_at = new Date(response.body.join_at);
			response.body.user.last_login_at = new Date(response.body.last_login_at);

			expect(response.body).toEqual({
				user: {
					username: "test1",
					first_name: "Test1",
					last_name: "Testy1",
					phone: "+1111111111",
					join_at: expect.any(Date),
					last_login_at: expect.any(Date),
				},
			});
		});

		test("wont get a user if different user logged in", async function () {
			let response = await request(app)
				.get("/users/test1")
				.send({ _token: u2Token });
			expect(response.statusCode).toEqual(401);
		});

		test("wont get a user if not logged in", async function () {
			let response = await request(app).get("/users/test1");
			expect(response.statusCode).toEqual(401);
		});
	});

	/** GET users/:username/to */

	describe("GET users/:username/to", function () {});

	/** GET users/:username/from */

	describe("GET users/:username/from", function () {});
});

afterAll(async function () {
	await db.end();
});
