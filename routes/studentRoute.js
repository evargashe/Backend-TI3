import express from 'express';
import { signIn, profile, confirmAccount, authenticateStudent, forgetPassword, checkToken,
    newPassword, viewSchedules, viewEquipment, reserverEquipment, getUserId, getUserHistoryById,
    getStudentById,
    getItemById,
    updateStudentById,
    getAcceptedReservations,
    getItemDetailsById
} from '../controllers/studentController.js';
import checkAuth from '../middleware/authMiddleware.js';


const router = express.Router();

// public routes
router.post("/", signIn);
router.get("/confirmar-cuenta/:token", confirmAccount);
router.post("/login", authenticateStudent);

router.post("/reset-password", forgetPassword);
router.route("/reset-password/:token").get(checkToken).post(newPassword);

router.get("/view-schedules/:type", viewSchedules);
router.get("/view-equipments/:type", viewEquipment);

// Agrega esta nueva ruta en tu archivo de rutas
router.get('/confirmacion-exitosa', (req, res) => {
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
});


// private routes
router.get("/profile", checkAuth, profile);
router.post("/reservations/:type", reserverEquipment);

router.get('/get-user-id', getUserId);

// obtener las reservas por id
router.get('/user-history-by-id/:userId', getUserHistoryById);

// Obtener los datos del estudiante
router.get("/getStudentById/:userId", getStudentById);

// Agrega esta nueva ruta en tu archivo de rutas
router.get('/get-item-by-id/:itemType/:itemId', getItemById);

//Actualizar estudiante por id
router.put('/update-student-by-id/:id', updateStudentById);

// Obtener las reservaciones segun el tipo
router.get("/accepted-reservations/:type", getAcceptedReservations);

//Obtener libro o equipo por id
router.get("/getDetailsItem/:type/:itemId", getItemDetailsById);


export default router;