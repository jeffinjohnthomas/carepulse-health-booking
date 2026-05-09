const express = require('express');
const router = express.Router();

router.post('/', (req, res) => res.json({ message: 'Book consultation' }));

module.exports = router;
