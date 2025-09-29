require('dotenv').config();

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const { buildMySqlFilter, buildMySqlInsert, msySqlUpdateConstructor, checkExistence } = require('../../../utils/sql_contructors');
const { apiClientError, apiServerError } = require('../../../utils/api_error_handler');
const { checkSchema, validationResult, param, query, matchedData } = require('express-validator');
const { validateObject } = require('../../../utils/functions');

const { getEcommerceBySHPCode } = require("../../../utils/atom_db");

const getCodesValidation = require("../../../validation/v1/codes/vl_get_codes"); 
router.get('/', checkSchema(getCodesValidation), async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

	const validationData = matchedData(req, { locations: ['query'], includeOptionals: true });
    validateObject(req.query, validationData);

    const query_data = Object.entries(req.query);

    let data = [];
    try {
        const [rows_1] = await db.query(
          `select * from shipping_codes ${
            query_data.length > 0
              ? "where " +
                query_data
                  .map(([key, value]) => {
                    return value != "null"
                      ? `${key} = ${value}`
                      : `${key} is null`;
                  })
                  .join(" and ")
              : ""
          }`
        );  
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

const postCodesValidation = require("../../../validation/v1/codes/vl_post_codes"); 
router.post('/', checkSchema(postCodesValidation), async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    let origin;

    switch (true) {
        case !isNaN(req.body.code) && !isNaN(parseFloat(req.body.code)):
            origin = 2;
            break;
        case req.body.code.includes("GC"):
            origin = 2;
            break;       
        case req.body.code.includes("BR"):
            origin = 1;
            break;
        default:
            return apiClientError(req, res, [], "O formato do código de envio é inválido.", 400)
    }

    const ecommerce_name = await getEcommerceBySHPCode(req.body.code);

    req.body.marketplace_id = origin;
    req.body.ecommerce_label = ecommerce_name;

    const sql = buildMySqlInsert("shipping_codes", req.body);

    let data = [];
    try {

        const [rows] = await db.query(`select * from shipping_codes where code = ?`, [req.body.code.trim()]);

        if(rows.length > 0){
            return apiClientError(req, res, [], `O código de envio ${req.body.code} já foi criado.`, 400)
        }
    
        await db.query(sql, Object.values(req.body));
        const [rows_1] = await db.query(`SELECT * FROM shipping_codes order by id desc limit 1`);  
        data = rows_1[0];
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "Shipping code created successfully",
            data: data,
        }
    );
});

const putCodesValidation = require("../../../validation/v1/codes/vl_put_codes"); 
router.put('/:id', param('id').isInt(), checkSchema(putCodesValidation), async (req, res) => {
    const id = req.params.id;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

    try {
        await checkExistence([
            {
                id: id,
                table: "shipping_codes",
                field: "params 'id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    let data = [];

    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    const sqlUpdate = msySqlUpdateConstructor("shipping_codes", id, req.body);

    try {
        await db.execute(sqlUpdate.sql, sqlUpdate.values.map(e => {return e == 'false' ? false : true}));
        let [rows_1] = await db.execute(`select * from shipping_codes where id = ${id};`);
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res, error)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Code updated successfully",
            data: data,
        }
    );
});

module.exports = router;