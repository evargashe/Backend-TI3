import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = mongoose.Schema({
    firstname: {
        type: String,
        require: true,
        trim: true,
    },
    lastname: {
        type: String,
        require: true,
        trim: true,
    },
    password: {
        type: String,
        require: true,
    },
    checkPassword: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    telephone: {
        type: Number,
        default: null,
        trim: true,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },

});

// Encriptar las contraseñas antes de guardarlas en la base de datos
adminSchema.pre('save', async function (next) {
    try {
        // Verificar si la contraseña principal ha sido modificada
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        // Verificar si la contraseña de verificación ha sido modificada
        if (this.isModified('checkPassword')) {
            const checkSalt = await bcrypt.genSalt(10);
            this.checkPassword = await bcrypt.hash(this.checkPassword, checkSalt);
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Método para verificar la contraseña principal
adminSchema.methods.checkPasswordMethod = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error('Error al comparar contraseñas');
    }
};

// Método para verificar la contraseña de verificación
adminSchema.methods.checkCheckPasswordMethod = async function (checkPassword) {
    try {
        return await bcrypt.compare(checkPassword, this.checkPassword);
    } catch (error) {
        throw new Error('Error al comparar contraseñas de verificación');
    }
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
