import jwt from 'jsonwebtoken'

// utility authentication middleware
const authUtility = async (req, res, next) => {
    const { btoken } = req.headers
    if (!btoken) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        const token_decode = jwt.verify(btoken, process.env.JWT_SECRET)
        req.body.docId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authUtility;