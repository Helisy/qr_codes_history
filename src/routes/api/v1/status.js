require('dotenv').config();

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

router.get('/', async (req, res) => {

    let data = [];
    try {
        const [rows_1] = await db.query(`select * from status`);  
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Success",
            data: data,
        }
    );
});

module.exports = router;