module.exports = {
    batch_id: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => field == "null" ? true : Number.isInteger(parseInt(field)) && field > 0,
            errorMessage: "batch_id 'limit' must be an interger or 'null'.",
        },
    },
    marketplace_id: {
        optional: {
            options: {
             nullable: true,
            }
        },
        isInt: {
            errorMessage: 'The field marketplace_id must be an interger.',
            // options: { min: 1, max: 100000 },
        },
    },
    has_entry: {
        optional: {
            options: {
             nullable: true,
            }
        },
        isBoolean: {
            errorMessage: 'The field has_entry must be boolean.',
            // options: { min: 1, max: 100000 },
        },
    },
    has_exit: {
        optional: {
            options: {
             nullable: true,
            }
        },
        isBoolean: {
            errorMessage: 'The field has_exit must be boolean.',
            // options: { min: 1, max: 100000 },
        },
    },
}