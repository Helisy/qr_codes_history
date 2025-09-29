module.exports = {
    status_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'The value status_id must be an interger.',
            // options: { min: 1, max: 100000 },
        },
    },
}