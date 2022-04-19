"use strict";

const Router = require("express").Router;
const router = new Router();
const db = require('../db');
const User = require('../models/user');
const { SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require("../expressError");
const { json } = require("body-parser");


/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res) {
  const { username, password } = req.body;
  if (await User.authenticate(username, password)) {
    const token = jwt.sign({ username }, SECRET_KEY);
    res.locals.user = await User.get(username);

    await User.updateLoginTimestamp(username);
    return res.json({ token });
  }
  throw new UnauthorizedError("Invalid user/password");
})


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async function (req, res) {
  const { username, password, first_name, last_name, phone } = req.body;
  const user = await User.register({ username, password, first_name, last_name, phone });

  const token = jwt.sign({ username }, SECRET_KEY);
  res.locals.user = user;

  await User.updateLoginTimestamp(username);
  return res.status(201).json({ token });
})

module.exports = router;