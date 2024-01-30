import mongoose from "mongoose";
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import generateID from "../helpers/generateID.js";
import generateJWT from "../helpers/generateJWT.js";
import Student from "../models/Student.js";
import ReservationBook from "../models/ReservationBooks.js";
import ReservationEquipment from "../models/ReservationEquipment.js";
import UserHistory from '../models/History.js';
import Book from '../models/Book.js'
import Equipment from "../models/Equipment.js";

const VALID_TYPES = ['books', 'equipments'];

const signIn = async (req, res) => {
    const { email, firstname, lastname, CUI, telephone, password } = req.body;

    // Verificar si ya existe un estudiante con el mismo correo
    const existsStudent = await Student.findOne({ email });

    if (existsStudent) {
        const error = new Error("Estudiante existente");
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Crear una nueva instancia de Student con los valores proporcionados
        const student = new Student({
            firstname,
            lastname,
            CUI, // Puedes asignar el valor proporcionado o el valor por defecto según sea necesario
            telephone, // Puedes asignar el valor proporcionado o el valor por defecto según sea necesario
            password,
            email,
        });

        const token = generateID();
        student.token = token;
        // Guardar el nuevo estudiante
        const studentSave = await student.save();

        // Enviar correo de confirmación
        const confirmLink = `${process.env.APP_URL}/api/students/confirmar-cuenta/${token}`;
        sendConfirmationEmail(student.email, confirmLink);
        // Enviar una respuesta exitosa
        res.json(studentSave);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const profile = (req, res) => {
    const { student } = req;
    res.json({ student });
}


const sendConfirmationEmail = (email, confirmLink) => {
    console.log('Confirmation Link:', confirmLink); // Agrega esta línea para registrar el enlace de confirmación
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Confirmación de cuenta',
        text: `Por favor, haz clic en el siguiente enlace para confirmar tu cuenta: ${confirmLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo de confirmación:', error);
        } else {
            console.log('Correo de confirmación enviado:', info.response);
        }
    });
};

const confirmAccount = async (req, res) => {
    // Leer valores de la URL
    const { token } = req.params;
    const studentConfirm = await Student.findOne({ token });

    if (!studentConfirm) {
        const error = new Error('Token no válido');
        return res.status(404).json({ msg: error.message });
    }

    try {
        // Actualizar los datos del estudiante
        studentConfirm.token = null;
        studentConfirm.confirmado = true;
        await studentConfirm.save();

        // Redirigir al usuario a una página de confirmación
        res.send(`
        <html>
        <head>
            <style>
                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .message-container {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="message-container">
                <h1>¡Tu cuenta ha sido confirmada exitosamente!</h1>
            </div>
        </body>
        </html>
    `);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};


const authenticateStudent = async (req, res) => {
    const { email, password } = req.body;

    // Buscar un estudiante por correo electrónico
    const student = await Student.findOne({ email });

    if (!student) {
        const error = new Error('El estudiante no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Verificar si el estudiante no está autenticado
    if (!student.confirmado) {
        // Enviar un correo electrónico con el enlace de confirmación
        const token = generateID(); // Generar un nuevo token
        student.token = token;
        await student.save();

        const confirmLink = `${process.env.APP_URL}/api/students/confirmar-cuenta/${token}`;

        // Enviar correo electrónico con el enlace de confirmación
        sendConfirmationEmail(student.email, confirmLink);

        return res.status(403).json({ msg: 'Tu cuenta no ha sido confirmada. Se ha enviado un correo electrónico para la confirmación. Por favor, revisa tu correo electrónico y sigue las instrucciones para confirmar tu cuenta.' });
    }

    // Verificar la contraseña
    if (await student.checkPasswordStudent(password)) {
        // Autenticar al estudiante

        const token = generateJWT(student.id);

        // Establecer la cookie con el token
        res.cookie('token', token, {
            httpOnly: true,
            // Otras opciones de configuración...
        });

        // Enviar el token al cliente
        return res.json({
            token,
            student: {
                _id: student._id,
                firstname: student.firstname,
                lastname: student.lastname,
                email: student.email,
            },
        });
    } else {
        const error = new Error('La contraseña es incorrecta');
        return res.status(403).json({ msg: error.message });
    }
};



const sendResetPasswordEmail = (email, resetLink) => {
    // Configurar el transporte del nodemailer, similar a como lo has hecho para la confirmación de cuenta
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    // Configurar las opciones del correo electrónico
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Instrucciones para restablecer la contraseña',
        html: `
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="${resetLink}">${resetLink}</a>
        `,
    };

    // Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico de restablecimiento de contraseña:', error);
        } else {
            console.log('Correo electrónico de restablecimiento de contraseña enviado:', info.response);
        }
    });
};

const forgetPassword = async (req, res) => {
    const { email } = req.body;

    // Comprobar si ya existe un estudiante con el mismo correo
    const existStudent = await Student.findOne({ email });

    if (!existStudent) {
        const error = new Error('El usuario no existe');
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Generar un nuevo token con información de expiración para restablecimiento de contraseña
        const token = jwt.sign({ userId: existStudent._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Almacenar el token de restablecimiento de contraseña en el estudiante
        existStudent.token = token;
        await existStudent.save();

        // Enviar correo electrónico con instrucciones y token de restablecimiento
        console.log(process.env.APP_URL_FRON)
        const resetLink = `${process.env.APP_URL_FRON}/reset-password/${token}`;
        sendResetPasswordEmail(existStudent.email, resetLink);

        res.json({ msg: 'Hemos enviado un correo electrónico con las instrucciones para restablecer la contraseña.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};

const checkToken = async (req, res) => {
    const { token } = req.params;

    const tokenValid = await Student.findOne({ token });

    if (tokenValid) {
        // The Token is valid the user exists
        res.json({ msg: "Token válido y el usuario existe" });
    } else {
        const error = new Error("Token no válido");
        return res.status(400).json({ msg: error.message });
    }
}

const newPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const existStudentToken = await Student.findOne({ token: token });

    if (!existStudentToken || !existStudentToken.token) {
        const error = new Error("Token no válido o ya ha sido utilizado");
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Cambiar las propiedades del modelo del estudiante
        existStudentToken.token = null;
        existStudentToken.password = password;
        await existStudentToken.save();

        res.json({ msg: "Contraseña modificada correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: 'Token no válido o expirado' });
    }
};

const viewSchedules = async (req, res) => {

}

const viewEquipment = async (req, res) => {
    const { type } = req.params;
    const VALID_TYPES = ["books", "equipments"];

    if (!VALID_TYPES.includes(type)) {
        const error = new Error("No existe tal categoria, debe elegir entre libros o equipos");
        return res.status(404).json({ msg: error.message });
    }

    try {
        let collection = mongoose.connection.db.collection(type);

        let data = await collection.find({}).toArray();

        res.json(data)
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Se ha producido un error al acceder a los datos' });
    }
}

const reserverEquipment = async (req, res) => {
    const { type, idEquip } = req.params;
    const VALID_TYPES = ["books", "equipments"];

    if (type === VALID_TYPES[0]) {
        const reservationBookData = { ...req.body }; // No necesitas agregar status: 'pendiente'
        const reservationBook = new ReservationBook(reservationBookData)
        try {
            const reservationBookStored = await reservationBook.save();
            res.json(reservationBookStored);
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Error interno del servidor al reservar libro' });
        }
    } else if (type === VALID_TYPES[1]) {
        const reservationEquipment = new ReservationEquipment(req.body);

        try {
            const reservationEquipmentStored = await reservationEquipment.save();
            res.json(reservationEquipmentStored);
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Error interno del servidor al reservar equipo' });
        }
    } else {
        const error = new Error("No existe tal categoría, debe elegir entre libros o equipos");
        return res.status(404).json({ msg: error.message });
    }
};


const getUserId = async (req, res) => {
    const userId = req.student._id;
    res.json({ userId });
}

const getUserHistoryById = async (req, res) => {
    try {
        const requestedUserId = req.params.userId;

        // Buscar historial del usuario por el ID proporcionado
        const userHistory = await UserHistory.find({ userId: requestedUserId }).populate('userId');

        if (!userHistory) {
            return res.status(404).json({ msg: 'Historial no encontrado para el ID proporcionado' });
        }
        res.json(userHistory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor al obtener historial del usuario' });
    }
};


const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.userId;
        // Busca al estudiante por ID en la base de datos
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }
        // Retorna los datos del estudiante
        console.log()
        res.json(student);
    } catch (error) {
        console.error('Error al obtener los datos del estudiante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getItemById = async (req, res) => {
    try {
        const { itemId, itemType } = req.params;

        // Determinar si se debe buscar un libro o un equipo
        let productModel, product;

        if (itemType === 'Book') {
            productModel = Book;
        } else if (itemType === 'Equipment') {
            productModel = Equipment;
        } else {
            return res.status(400).json({ error: 'Tipo de producto no válido' });
        }

        // Buscar el producto por ID en la base de datos
        product = await productModel.findById(itemId);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        // Retorna los datos del producto
        res.json(product);
    } catch (error) {
        console.error('Error al obtener los datos del producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const updateStudentById = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Datos actualizados del estudiante

    try {
        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedStudent);
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const getAcceptedReservations = async (req, res) => {
    const { type } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        let collection;
        if (type === "books") {
            collection = await ReservationBook.find({ state: "ACEPTADO" });
        } else if (type === "equipments") {
            collection = await ReservationEquipment.find({ state: "ACEPTADO" });
        }
        res.json(collection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las reservaciones aceptadas" });
    }
};

const getItemDetailsById = async (req, res) => {
    const { type, itemId } = req.params;
    const VALID_TYPES = ['books', 'equipments'];

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        let item;

        // Utiliza el modelo específico según el tipo para buscar el elemento por ID
        if (type === 'books') {
            item = await Book.findById(itemId);
        } else if (type === 'equipments') {
            item = await Equipment.findById(itemId);
        } else {
            return res.status(400).json({ error: 'Tipo de producto no válido' });
        }

        if (!item) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        // Retornar los detalles del elemento
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los detalles del elemento por ID' });
    }
};


export {
    signIn,
    profile,
    confirmAccount,
    authenticateStudent,
    forgetPassword,
    checkToken,
    newPassword,
    viewSchedules,
    viewEquipment,  
    reserverEquipment,
    getUserId,
    getUserHistoryById,
    getStudentById,
    getItemById,
    updateStudentById,
    getAcceptedReservations,
    getItemDetailsById
};