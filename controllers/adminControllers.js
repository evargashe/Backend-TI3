import Book from "../models/Book.js";
import Equipment from "../models/Equipment.js";
import ReservationBooks from '../models/ReservationBooks.js';
import ReservationEquipments from '../models/ReservationEquipment.js';
import Student from '../models/Student.js';
import userHistory from "../models/History.js";
const VALID_TYPES = ['books', 'equipments'];
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js';

const createItem = async (req, res) => {
    const { type } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        if (type === "books") {
            const newBook = new Book(req.body);
            const savedBook = await newBook.save();
            res.status(201).json(savedBook);
        } else if (type === "equipments") {
            const newEquipment = new Equipment(req.body);
            const savedEquipment = await newEquipment.save();
            res.status(201).json(savedEquipment);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el item" });
    }
};

const getAllItems = async (req, res) => {
    const { type } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }
    try {
        let collection;
        if (type === "books") {
            collection = await Book.find();
        } else if (type === "equipments") {
            collection = await Equipment.find();
        }
        res.json(collection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los items" });
    }
};

const updateItemById = async (req, res) => {
    const { type, itemId } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        let updatedItem;
        if (type === "books") {
            updatedItem = await Book.findByIdAndUpdate(itemId, req.body, { new: true });
        } else if (type === "equipments") {
            updatedItem = await Equipment.findByIdAndUpdate(itemId, req.body, { new: true });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el item" });
    }
};

const deleteItemById = async (req, res) => {
    const { type, itemId } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        if (type === "books") {
            await Book.findByIdAndDelete(itemId);
        } else if (type === "equipments") {
            await Equipment.findByIdAndDelete(itemId);
        }

        res.json({ message: "Item eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el item" });
    }
};

const getCategory = async (req, res) => {
    try {
        const categories = await Book.distinct("category");
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las categorías de libros" });
    }
};


const getItemById = async (req, res) => {
    const { type, itemId } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        let item;
        if (type === "books") {
            // Reemplaza 'Book' con el nombre real de tu modelo de libro
            item = await Book.findById(itemId);
        } else if (type === "equipments") {
            // Reemplaza 'Equipment' con el nombre real de tu modelo de equipo
            item = await Equipment.findById(itemId);
        }

        if (!item) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del elemento por ID' });
    }
};

const getReservation = async (req, res) => {
    const { type } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }
    try {
        let collection;
        if (type === "books") {
            collection = await ReservationBooks.find();
        } else if (type === "equipments") {
            collection = await ReservationEquipments.find();
        }
        res.json(collection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las reservaciones" });
    }
};

const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        // Busca al estudiante por ID en la base de datos
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }
        // Retorna los datos del estudiante
        res.json(student);
    } catch (error) {
        console.error('Error al obtener los datos del estudiante:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const updateReservation = async (req, res) => {
    const { reservationId, newStatus } = req.body;
    const { type } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        let reservation;

        if (type === "books") {
            // Buscar la reserva de libro por ID
            reservation = await ReservationBooks.findById(reservationId);
        } else if (type === "equipments") {
            // Buscar la reserva de equipo por ID
            reservation = await ReservationEquipments.findById(reservationId);
        } else {
            return res.status(400).json({ msg: 'Tipo de reserva no válido' });
        }

        if (!reservation) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }

        // Actualizar el estado
        reservation.state = newStatus;

        if (newStatus === 'ACEPTADO') {
            // Reducir la cantidad en uno si el estado es "ACEPTADO"
            const itemType = type === 'books' ? Book : Equipment;

            // Obtener el ID del libro o equipo según el tipo de reserva
            const itemId = type === 'books' ? reservation.bookId : reservation.equipmentId;

            // Actualizar la cantidad en el modelo correspondiente
            await itemType.findByIdAndUpdate(itemId, { $inc: { amount: -1 } });
        }
        if (newStatus === 'RECHAZADO') {
            // Programar la eliminación después de 1 hora
            const scheduledDeletionTime = new Date();
            //scheduledDeletionTime.setSeconds(scheduledDeletionTime.getSeconds() + 30);
            scheduledDeletionTime.setHours(scheduledDeletionTime.getHours() + 1);

            reservation.deleteScheduled = scheduledDeletionTime;
            await reservation.save();
        }

        if (newStatus === 'ACEPTADO' || newStatus === 'PENDIENTE') {
            if (reservation.deleteScheduled) {
                clearTimeout(reservation.deleteScheduled);
                reservation.deleteScheduled = null;
            }
        }

        // Guardar los cambios en la reserva
        await reservation.save();

        res.json({ msg: 'Estado de la reserva actualizado con éxito y cantidad reducida si es necesario' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor al actualizar la reserva' });
    }
};


const getItemDetailsById = async (req, res) => {
    const { type, itemId } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
        const error = new Error("Tipo de categoría no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        let item;
        if (type === "books") {
            item = await Book.findById(itemId);
        } else if (type === "equipments") {
            item = await Equipment.findById(itemId);
        }

        if (!item) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los detalles del elemento por ID' });
    }
};


const deleteReservation = async (req, res) => {
    console.log('Botón de clic ejecutado');
    try {
        const { type, id } = req.params;

        // Determinar el modelo de reserva según el tipo (libro o equipo)
        const ReservationModel = type === 'book' ? ReservationBooks : ReservationEquipments;

        // Eliminar la reserva por ID
        const deletedReservation = await ReservationModel.findByIdAndDelete(id);

        if (!deletedReservation) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
        }

        return res.status(200).json({ success: true, message: 'Reserva eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const updateCurrentTime = async (req, res) => {
    try {
        const { type, id, itemId } = req.params;

        // Determinar el modelo de reserva según el tipo (libro o equipo)
        const ReservationModel = type === 'book' ? ReservationBooks : ReservationEquipments;

        // Actualizar el currentTime por ID
        const updatedReservation = await ReservationModel.findByIdAndUpdate(
            id,
            { currentTime: new Date() },
            { new: true }
        );

        // Construir el objeto de datos para el historial
        const historyData = {
            userId: updatedReservation.userId,
            itemId: type === 'book' ? updatedReservation.bookId : updatedReservation.equipmentId,
            itemType: type === 'book' ? 'Book' : 'Equipment',
            returnDate: type === 'book' ? updatedReservation.returnDate : updatedReservation.reservationDateTime,
            state: updatedReservation.state,
            currentTime: updatedReservation.currentTime, // Usar el currentTime actualizado
        };

        // Verificar si endHour existe en la reserva antes de incluirlo en historyData
        if ('endHour' in updatedReservation) {
            historyData.endHour = updatedReservation.endHour;
        }

        // Crear un nuevo registro en el historial
        const historyRecord = new userHistory(historyData);

        // Verificar si hay errores de validación
        const validationError = historyRecord.validateSync();
        if (validationError) {
            console.error('Error de validación al crear el registro en el historial:', validationError.errors);
            return res.status(400).json({ success: false, message: 'Error de validación al crear el registro en el historial' });
        }
        // Guardar el nuevo registro en el historial
        await historyRecord.save();

        // Eliminar la reserva después de guardarla en el historial
        await ReservationModel.findByIdAndDelete(id);

        if (type === 'book') {
            await Book.findByIdAndUpdate(itemId, { $inc: { amount: 1 } });
        } else if (type === 'equipment') {
            await Equipment.findByIdAndUpdate(itemId, { $inc: { amount: 1 } });
        }

        if (!updatedReservation) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
        }

        return res.status(200).json({ success: true, message: 'currentTime actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar currentTime:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};


const updateReservationDevolution = async (req, res) => {
    try {
        const { type, id } = req.params;

        // Determinar el modelo de reserva según el tipo (libro o equipo)
        const ReservationModel = type === 'book' ? ReservationBooks : ReservationEquipments;
        // Construir el objeto de actualización según el tipo
        let updateObject = {};
        if (type === 'book') {
            updateObject = { returnDate: req.body.returnDate };
        } else if (type === 'equipment') {
            updateObject = {
                reservationDateTime: req.body.reservationDateTime,
                endHour: req.body.endHour
            };
        }

        // Realizar la actualización
        const updatedReservation = await ReservationModel.findByIdAndUpdate(
            id,
            updateObject,
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ success: false, message: `${type} no encontrado` });
        }

        return res.status(200).json({ success: true, message: `${type} actualizado correctamente` });
    } catch (error) {
        console.error(`Error al actualizar la reserva de ${type}:`, error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const getUserHistory = async (req, res) => {
    try {
        // Obtener todos los registros del historial
        const historyData = await userHistory.find();
        res.json(historyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial de usuarios' });
    }
};

const generateTokenAndSendEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Genera un token con la información del correo y una expiración de 24 horas
        const token = jwt.sign({ email }, 'secreto', { expiresIn: '24h' });

        // Configura el transporte de correo para Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // Reemplaza con tu correo de Gmail
                pass: process.env.GMAIL_PASS, // Reemplaza con tu contraseña de Gmail
            },
        });

        // Construye el enlace con el token y el correo como parámetro
        const link = `${process.env.APP_URL_FRON}/registro-admin/${token}?email=${encodeURIComponent(email)}`;
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Registro como Administrador',
            text: `Por favor, haz clic en el siguiente enlace para completar tus datos: ${link}`,
        };

        // Envía el correo
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Correo con enlace enviado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar el correo con el enlace' });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, telephone, password } = req.body;

        // Verifica si el correo ya está registrado
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Crea un nuevo administrador
        const newAdmin = new Admin({ firstname, lastname, email, telephone, password });
        await newAdmin.save();

        res.status(201).json({ message: 'Administrador registrado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el administrador' });
    }
};

const getAdminData = async (req, res) => {
    try {
        const { email } = req.params;

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            // Si el correo ya está registrado, devolver los datos del administrador
            return res.json({
                email: existingAdmin.email,
                firstname: existingAdmin.firstname,
                lastname: existingAdmin.lastname,
                telephone: existingAdmin.telephone,
            });
        }

        // Si el correo no está registrado, devolver un mensaje indicando que no se encontró el administrador
        return res.status(404).json({ error: 'No se encontró el administrador' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del administrador' });
    }
};


const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the admin by email
        const admin = await Admin.findOne({ email });

        // Check if admin exists and password is correct
        if (!admin || !(await admin.checkPasswordMethod(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate and sign a JWT token
        const token = jwt.sign({ email }, 'secreto', { expiresIn: '24h' });

        res.json({
            token,
            admin: {
                _id: admin._id,
                firstname: admin.firstname,
                lastname: admin.lastname,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateStateIfAmountIsZero = async (req, res) => {
    try {
        const { type, id } = req.params;

        let model;
        if (type === 'book') {
            model = Book;
        } else if (type === 'equipment') {
            model = Equipment;
        } else {
            return res.status(400).json({ error: 'Tipo no válido' });
        }

        const item = await model.findById(id);

        if (!item) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }

        if (item.amount === 0) {
            // Actualizar el estado a "FUERA DE STOCK"
            await model.findByIdAndUpdate(id, { state: 'FUERA DE STOCK' });
            return res.json({ message: 'Estado actualizado correctamente' });
        } else {
            return res.status(400).json({ error: 'La cantidad no es cero' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const updateStateToAvailableIfZero = async (req, res) => {
    try {
        const { type, id } = req.params;

        let model;
        if (type === 'book') {
            model = Book;
        } else if (type === 'equipment') {
            model = Equipment;
        } else {
            return res.status(400).json({ error: 'Tipo no válido' });
        }

        const item = await model.findById(id);

        if (!item) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }

        if (item.amount === 0 && item.state !== 'DISPONIBLE') {
            // Actualizar el estado a "DISPONIBLE" solo si la cantidad es 0 y el estado no es "DISPONIBLE" actualmente
            await model.findByIdAndUpdate(id, { state: 'DISPONIBLE' });
            return res.json({ message: 'Estado actualizado correctamente a DISPONIBLE' });
        } else {
            return res.json({ message: 'No se hizo ninguna actualización, la cantidad no es 0 o el estado ya es DISPONIBLE' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
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
        subject: 'Instrucciones para restablecer la contraseña del Administrador',
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


const forgetPasswordAdmin = async (req, res) => {
    const { email } = req.body;

    try {
        const existAdmin = await Admin.findOne({ email });

        if (!existAdmin) {
            const error = new Error('El usuario no existe');
            return res.status(400).json({ msg: error.message });
        }

        const token = jwt.sign({ userId: existAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const resetLink = `${process.env.APP_URL_FRON}/admin/reset-password-admin/${token}?email=${encodeURIComponent(email)}`;

        existAdmin.resetPasswordToken = token;
        existAdmin.resetPasswordExpires = Date.now() + 3600000; // 1 hora de expiración
        await existAdmin.save();

        await sendResetPasswordEmail(existAdmin.email, resetLink);

        res.json({ msg: 'Hemos enviado un correo electrónico con las instrucciones para restablecer la contraseña.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};



const updateAdminPassword = async (req, res) => {
    try {
        const { email, newPassword, token } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado' });
        }

        // Verificar si el token ha expirado
        if (admin.resetPasswordExpires && admin.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ error: 'El enlace para restablecer la contraseña ha expirado. Solicite un nuevo enlace.' });
        }

        // Verificar si el token almacenado en el administrador coincide con el proporcionado en la solicitud
        if (admin.resetPasswordToken !== token) {
            return res.status(400).json({ error: 'Token no válido para restablecer la contraseña.' });
        }

        admin.password = newPassword;
        admin.resetPasswordToken = null;
        admin.resetPasswordExpires = null;
        await admin.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar la contraseña' });
    }
};



export {
    createItem,
    getAllItems,
    updateItemById,
    deleteItemById,
    getCategory,
    getItemById,
    getReservation,
    getStudentById,
    updateReservation,
    getItemDetailsById,
    deleteReservation,
    updateCurrentTime,
    updateReservationDevolution,
    getUserHistory,
    generateTokenAndSendEmail,
    registerAdmin,
    getAdminData,
    loginAdmin,
    updateStateIfAmountIsZero,
    updateStateToAvailableIfZero,
    forgetPasswordAdmin,
    updateAdminPassword
};
