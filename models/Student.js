import mongoose from "mongoose";
import bycrpt from "bcryptjs";
import generateID from "../helpers/generateID.js";

const studentSchema = mongoose.Schema({
    firstname:{
        type: String,
        require: true,
        trim: true,
    },
    lastname:{
        type: String,
        require: true,
        trim: true,
    },
    password:{
        type: String,
        require: true,
    },
    email:{
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    telephone:{
        type: Number,
        default: null,
        trim: true,
    },
    CUI:{
        type: Number,
        require: true,
        default: null,
        unique: true,
        trim: true,
    },
    token:{
        type: String,
        default: null
    },
    confirmado: {
        type: Boolean,
        default: false, // Por defecto, un estudiante no está confirmado
    },
});

//encrypt the password
//before storing in the DB
studentSchema.pre('save', async function (next){
    //continue with the next middleware
    if(!this.isModified('password')){
        next();
    }
    const salt = await bycrpt.genSalt(10);
    this.password = await bycrpt.hash(this.password, salt);
});

//add function for check password (form - DB)
studentSchema.methods.checkPasswordStudent = async function(passwordForm){

    return await bycrpt.compare(passwordForm, this.password);
}

//register the schema in DB
const Student = mongoose.model("Student",studentSchema);



export default Student;