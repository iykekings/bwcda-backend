const router = require('express').Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PlayersDB = require('./player.model');
const { validateBody, validateLoginBody } = require('./player.middleware');

const salt = bcrypt.genSaltSync(12);

router.post('/register', validateBody, async (req, res) => {
  try {
    const regData = req.body;
    regData.password = bcrypt.hashSync(regData.password, salt);
    const newPlayer = await PlayersDB.create(regData);
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(500).json({ message: "Couldn't create the player" });
  }
});

router.post('/login', validateLoginBody, async (req, res) => {
  try {
    const loginData = req.body;
    const player = await PlayersDB.getByEmail(loginData.email);
    if (player) {
      const isUser = bcrypt.compareSync(loginData.password, player.password);
      if (isUser) {
        const token = genToken(player);
        res.status(200).json({ message: 'Logged in successfully', token });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      res.status(401).json({ message: "player doesn't exist in the database" });
    }
  } catch (error) {
    res.status(500).json({ message: "Couldn't login the player" });
  }
});

function genToken(player) {
  const payload = {
    sub: player.id,
    name: player.name
  };
  const options = {
    expiresIn: '1day'
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

module.exports = router;
