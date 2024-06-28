import jsonwebtoken from 'jsonwebtoken';
import responseHandler from '../handlers/response.handler.js';
import userModel from '../models/user.model.js';

const tokenDecode=(req)=>{
    try{
        const bearerHeader=req.headers['authorization'];
        if(bearerHeader){
            const bearer=bearerHeader.split(' ');
            const token=bearer[1];
            return jsonwebtoken.verify(token,process.env.JWT_SECRET);
        }
        else{
            return false
        }
    }
    catch{
        return false
    }
}

const auth= async (req,res,next)=>{
    const token=tokenDecode(req);
    if(!token){
        return responseHandler.unauthorize(res);
    }
    const user= await userModel.findOne(token.data);
    
    if(!user){
        return responseHandler.unauthorize(res);
    }
    req.user=user;
    next();
}

export default {auth,tokenDecode};
