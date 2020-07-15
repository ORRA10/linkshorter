const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../modules/User')
const router = Router()
const { check, validationResult } = require('express-validator')


// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Введен неверный емайл').isEmail(),
        check('password', 'пароль должен быть более 6 символов').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Введены не корректные данные'
                })
            }
            const { email, password } = req.body
            const candidate = await User.findOne({ email })

            if (candidate) {
                return res.status(400).json({ message: 'такой пользователь уже существует' })
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({ email: email, password: hashedPassword })

            await user.save()

            res.status(201).json({ message: 'пользователь создан' })

        } catch (error) {
            res.status(500).json({ message: 'что то полшо нет так попробуйте снова' })
        }
    })

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'введите корректный емайл').normalizeEmail().isEmail(),
        check('password', 'введите пароль').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Не корректные данные при входе в систему'
                })
            }
            
            const {email,password} = req.body
            const user = await User.findOne({email})
            if (!user){
                return req.status(400).json({message:'Пользователь не найден'})
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch){
                return res.status(400).json({message:'Неверный пароль, попробуйте снова'})
            }
            const token = jwt.sign(
                {userId:user.id},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )

            res.json({token, userId:user.id})

        } catch (error) {
            res.status(500).json({ message: 'что то полшо нет так попробуйте снова' })
        }
    })

module.exports = router