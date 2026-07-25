const { test } = require('tap');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, hashPassword } = require('../controllers/authController');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

test('hashPassword returns a hash and verifies correctly', async (t) => {
  const password = 'MyStrongPassword123!';
  const hashed = await hashPassword(password);
  t.ok(hashed, 'hashed password should be returned');
  t.notOk(hashed === password, 'hashed password should not equal raw password');

  const isMatch = await bcrypt.compare(password, hashed);
  t.ok(isMatch, 'hashed password should match original password');
});

test('generateToken returns a valid JWT token', async (t) => {
  const userId = 'abc123';
  const token = generateToken(userId);

  t.ok(token, 'token should be returned');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  t.equal(decoded.id, userId, 'token payload should contain the correct id');
});
