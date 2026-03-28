function success(code, message, data, res, extra) {
    res.payload = {  errors: [] }
    return res.status(code).json({ code: code, message: message, data: data ? data : {}, ...extra })
}

function error(code, message, res, extra) {
    res.payload = {  errors: [code,message] }
    return res.status(code).json({
        error: {
            message,
            code: code,
            extra
        }
    })
}

module.exports = {
    success,
    error
}