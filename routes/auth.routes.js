const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const router = Router()

router.post('/register',
    [
        check('email', 'not correct email').isEmail(),
        check('password', 'short pass').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'not correct information'
                })
            }

            const { email, password } = req.body

            const candidate = await User.findOne({ email })
            if (candidate) {
                return res.status(400).json({ message: 'this email already taken' })
            }

            const hashedpassword = await bcrypt.hash(password, 12)
            const user = new User({ email, password: hashedpassword })
            await user.save()

            res.status(201).json({ message: 'user created' })

        } catch (e) {
            res.status(500).json({ message: "something wrong" })
        }
    })

router.post('/login',
    [
        check('email', 'email not found').normalizeEmail().isEmail(),
        check('password', 'enter password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'not correct data'
                })
            }

            const { email, password } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                return res.status(400).json({ message: 'email doesnt excist' })
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({ message: "pass not correct" })
            }

            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )

            res.json({ token, userId: user.id})

        } catch (e) {
            res.status(500).json({ message: 'check email and password' })
        }
    })

module.exports = router