const jwt=require('jsonwebtoken')
const mongoose=require('mongoose');
const Users=mongoose.model('Student')
module.exports=(req,res,next)=>{
    const {authorization} =req.headers;
    if(!authorization){
        return res.status(401).send({error:"you must be logged in"})

    }
    const token = authorization.replace("Bearer ","");
    jwt.verify(token,process.env.JWT_SECRET,async (err,payload)=>{
        if(err){
            return res.status(401).send({error:"you must be logged in"})
        }
        const {userId}=payload;
        const user = await Users.findById(userId)
        req.user=user
        next();
    })
}