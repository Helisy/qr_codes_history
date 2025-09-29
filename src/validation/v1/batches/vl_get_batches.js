let dateFormat = /^\d{4}-\d{2}-\d{2}$/;
module.exports = {
    marketplace_id: 
    {
        in: ["query"],
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
    status_id: 
    {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (value) => value.includes(",") ? true : Number.isInteger(parseInt(value)) && value > 0,
            errorMessage: "Field 'status_id' must be an interger or string of interger separeted by ','.",
        },
    },
    date_from: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => dateFormat.test(field),
            errorMessage: "The 'date_from' field must follow the 'yyyy-mm-dd' pattern.",
        },
        toDate: false,
    },
    date_to: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => dateFormat.test(field),
            errorMessage: "The 'date_to' field must follow the 'yyyy-mm-dd' pattern.",
        },
        toDate: false,
    },
    order: {
        optional: {
            options: {
             nullable: true,
            }
        },
        isIn:{
            options: [["asc", "desc"]],
            errorMessage: "Field 'order' accepts 'asc' or 'desc'.",
        }
    },
    limit: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => field == "none" ? true : Number.isInteger(parseInt(field)) && field > 0,
            errorMessage: "Field 'limit' must be an interger or 'none'.",
        },
    },
}