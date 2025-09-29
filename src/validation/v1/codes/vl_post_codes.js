module.exports = {
    code: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: '"code" must be at least 6 chars long',
            options: { min: 6, max: 128  }
        }
    },
}