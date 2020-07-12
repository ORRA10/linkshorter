const {Router} = require('express')
const User = require('../modules/User')
const router = Router()


// /api/auth/register
router.post('/register', async (req,res)=>{
try {
    
const {email,password} = req.body
const candidate = await User.findOne({email})

if (candidate) {
    res.status(400).json({message: 'такой пользователь уже существует'})
}

} catch (error) {
    res.status(500).json({message: 'что то полшо нет так попробуйте снова'})
}
})

// /api/auth/login
router.post('/login', async (req,res)=>{
    
})

module.exports = router