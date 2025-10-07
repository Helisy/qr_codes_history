require('dotenv').config();

const express = require('express');
const router = express.Router();

const { checkSchema, validationResult, param, query, matchedData } = require('express-validator');

const database = require('../database');
const db = database();


router.get('/', async (req, res) => {
    res.redirect("/dashboard/insert-code");
});

router.get('/shopee', async (req, res) => {
    res.render("dashboard/codes_page");
});

router.get('/shein', async (req, res) => {
    res.render("dashboard/codes_page");
});

router.get('/not-tracked', async (req, res) => {
    res.render("dashboard/codes_page");
});


router.get('/insert-code', async (req, res) => {
    res.render("dashboard/insert_code");
});

router.get('/batches', async (req, res) => {
    res.render("dashboard/open_batches");
});

router.get('/batches/:id', param('id').isInt(), async (req, res) => {
    const id = req.params.id;

    const [rows] = await db.execute(`select * from batches where id = ?`, [id]);

    if(rows.length < 1) return res.redirect("/dashboard/batches");

    if(rows[0].status_id > 3) return res.redirect("/dashboard/batches");

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.redirect("/dashboard/batches");
    }

    res.render("dashboard/batch_codes");
});

router.get('/batches/:id/print', param('id').isInt(), async (req, res) => {
    const id = req.params.id;

    // const [rows] = await db.execute(`select * from batches where id = ?`, [id]);

    // if(rows.length < 1) return res.redirect("/dashboard/batches");

    // if(rows[0].status_id > 3) return res.redirect("/dashboard/batches");

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.redirect("/dashboard/batches");
    }

    res.render("dashboard/print_codes");
});

router.get('/history', async (req, res) => {
    res.render("dashboard/history");
});



module.exports = router;