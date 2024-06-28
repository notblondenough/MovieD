import userModel from "../models/user.model.js";
import responseHandler from "../handlers/response.handler.js";
import jsonwebtoken from "jsonwebtoken";

const signup= async (req,res)=>{
    try{
        const {username,displayName,password}=req.body;
        const checkUserExists=await userModel.findOne({username});
        if(checkUserExists){
            return responseHandler.badRequest(res,"User already exists");
        }
        const user=await userModel;
        user.displayName=displayName;
        user.username=username;
        user.setPassword(password);
        await user.save();
        const token=jsonwebtoken.sign({data:user._id},process.env.JWT_SECRET,{expiresIN:'30d'});
        return responseHandler.created(res,{
            token,
            ...user._doc,
            id: user.id
        });
    }
    catch{
        return responseHandler.error(res);
    }
}

const signin= async (req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await userModel.findOne({username}).select("username password  salt id displayName")

        if(!user){
            return responseHandler.badRequest(res,"User not found");
        }
        if(!user.validPassword(password)){
            return responseHandler.badRequest(res,"Invalid credentials");
        }
        const token=jsonwebtoken.sign({data:user._id},process.env.JWT_SECRET,{expiresIN:'30d'});

        user.password=undefined;
        user.salt=undefined;

        return responseHandler.ok(res,{
            token,
            ...user._doc,
            id: user.id
        });
    }
    catch{
        return responseHandler.error(res);
    }
}

const updatePassword= async (req,res)=>{
    try{
        const {password,newPassword}=req.body;
        const user=await userModel.findById(req.user.id).select("password salt id");
        if (!user){
            return responseHandler.unauthorize(res);
        }
        if(!user.validPassword(password)){
            return responseHandler.badRequest(res,"Wrong password");
        }
        user.setPassword(newPassword);
        await user.save();
        return responseHandler.ok(res);
    }
    catch{
        return responseHandler.error(res);
    }
}

const getInfo= async (req,res)=>{
    try{
        const user=await userModel.findById(req.user.id);
        if (!user){
            return responseHandler.notfound(res);
        }
        return responseHandler.ok(res,user);
    }
    catch{
        return responseHandler.error(res);
    }
}

export default {signup,signin,updatePassword,getInfo}
