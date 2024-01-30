import jwt  from "jsonwebtoken";
import Student from "../models/Student.js";


const checkAuth = async (req, res, next) =>{
    let token;
    //console.log(req.headers);

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.student = await Student.findById(decoded.id).select("-password -token -confirmado") ;
            
            return next();

        } catch (error) {
            const ex = new Error('Token no valido');
            return res.status(403).json({msg: ex.message});
        }
    }
    if(!token){
        const error = new Error('Token no valido');
        res.status(403).json({msg: error.message});    
    }
    
    next();
};

 export default checkAuth;