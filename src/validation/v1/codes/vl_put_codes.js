module.exports = {
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