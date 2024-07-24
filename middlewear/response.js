function success(req, res, message, data) {
    return res.status(200).json({
        message,
        data
    })
}

module.exports = {success};