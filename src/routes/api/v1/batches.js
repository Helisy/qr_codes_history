require('dotenv').config();

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const { buildMySqlFilter, buildMySqlInsert, msySqlUpdateConstructor, checkExistence } = require('../../../utils/sql_contructors');
const { apiClientError, apiServerError } = require('../../../utils/api_error_handler');
const { checkSchema, validationResult, param, query, matchedData } = require('express-validator');
const { validateObject } = require('../../../utils/functions');

const getBatchesValidation = require("../../../validation/v1/batches/vl_get_batches"); 
router.get('/', checkSchema(getBatchesValidation), async (req, res) => {

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

    let query_data = Object.entries(req.query);
    query_data = query_data.filter(([key, value]) => { return key == "marketplace_id" || key == "status_id"});

    let data = [];

    let sqlFilter;

    try {
        sqlFilter = buildMySqlFilter(
          req.query,
          `
        ${(() => {
          if (query_data.length > 0) {
            const conditions = query_data.map(
              ([key, value]) => value.includes(",") ? `${key} in (${value})` : `${key} = ${value}`
            );
            conditions.push("deleted_at is null");
            return conditions.join(" and ");
          } else {
            return "deleted_at is null";
          }
        })()}
        `
        );
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    try {
        const [rows_1] = await db.execute(
            `
            select 
                batches.*,
                status.label as status_label,
                marketplaces.label as marketplace_label
            from batches
                join status on status.id = batches.status_id
                join marketplaces on marketplaces.id = batches.marketplace_id
             ${sqlFilter};
            `
        );
        data = rows_1;

        for (let i = 0; i < data.length; i++) {
            const element = data[i];

            const [rows_2] = await db.execute(`select id from shipping_codes where batch_id = ?;`, [element.id]);
            const [rows_3] = await db.execute(`select id from shipping_codes where batch_id = ? and has_entry = ?;`, [element.id, 1]);
            const [rows_4] = await db.execute(`select id from shipping_codes where batch_id = ? and has_exit = ?;`, [element.id, 1]);

            data[i].quantity = rows_2.length;
            data[i].has_entry = rows_3.length;
            data[i].has_exit = rows_4.length;
        }

    } catch (error) {
        return apiServerError(req, res, error)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "",
            data: data,
        }
    );
});

router.get('/:id', param('id').isInt(), async (req, res) => {
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

    let data = [];

    try {
        const [rows_1] = await db.execute(
            `
            select 
                batches.*,
                status.label as status_label,
                marketplaces.label as marketplace_label
            from batches
                join status on status.id = batches.status_id
                join marketplaces on marketplaces.id = batches.marketplace_id
            where 
                batches.id = ?
            `, [id]);
        data = rows_1[0];

        const [rows_2] = await db.execute(`select id from shipping_codes where batch_id = ?;`, [data.id]);
        const [rows_3] = await db.execute(`select id from shipping_codes where batch_id = ? and has_entry = ?;`, [data.id, 1]);
        const [rows_4] = await db.execute(`select id from shipping_codes where batch_id = ? and has_exit = ?;`, [data.id, 1]);

        data.quantity = rows_2.length;
        data.has_entry = rows_3.length;
        data.has_exit = rows_4.length;

    } catch (error) {
        return apiServerError(req, res, error)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "",
            data: data,
        }
    );
});


const postBatchesValidation = require("../../../validation/v1/batches/vl_post_batches"); 
router.post('/', checkSchema(postBatchesValidation), async (req, res) => {

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


    try {
        await checkExistence([
            {
                id: req.body.marketplace_id,
                table: "marketplaces",
                field: "body 'marketplace_id'"
            }
        ], by_deleted_at=false)
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400);
    }

    req.body.status_id = 1;

    const sql = buildMySqlInsert("batches", req.body);

    let data = [];
    try {

        const [rows] = await db.query(`select * from shipping_codes where marketplace_id = ? and batch_id is null`, [req.body.marketplace_id]);

        if(rows.length < 1){
            return apiClientError(req, res, [], `Não há nenhum código de envio referente ao marketplace solicitado na fila.`, 400)
        }

        await db.query(sql, Object.values(req.body));
        const [rows_1] = await db.query(`SELECT * FROM batches order by id desc limit 1`);  


        await db.query(`update shipping_codes set batch_id = ? where marketplace_id = ? and batch_id is null`, [rows_1[0].id, req.body.marketplace_id]);


        data = rows_1[0];
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: `Batch ${data.id} created successfully`,
            data: data,
        }
    );
});

const putBatchesValidation = require("../../../validation/v1/batches/vl_put_batches"); 
router.put('/:id', param('id').isInt(), checkSchema(putBatchesValidation), async (req, res) => {
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
                table: "batches",
                field: "params 'id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    let data = [];

    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    const sqlUpdate = msySqlUpdateConstructor("batches", id, req.body);

    try {
       
        var [rows_2] = await db.execute(`select id from shipping_codes where batch_id = ?;`, [id]);
        var [rows_3] = await db.execute(`select id from shipping_codes where batch_id = ? and has_entry = ?;`, [id, 1]);
        var [rows_4] = await db.execute(`select id from shipping_codes where batch_id = ? and has_exit = ?;`, [id, 1]);
    } catch (error) {
        return apiServerError(req, res, error)
    }
    
    let conditionMet = false;

    switch (req.body.status_id) {
        case 2:
            conditionMet = rows_3.length < rows_2.length;
            break;
        case 3:
        case 4:
            conditionMet = rows_4.length < rows_2.length;
            break;
    }

    if (conditionMet) {
        return apiClientError(req, res, [], "Finalize a leitura de todos os códigos", 400);
    }

    try {
        await db.execute(sqlUpdate.sql, sqlUpdate.values);
        let [rows_1] = await db.execute(`select * from batches where id = ${id};`);
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res, error)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Batch updated successfully",
            data: data,
        }
    );
});

module.exports = router;