import schedule from 'node-schedule';
import  ReservationBooks  from './models/ReservationBooks.js'; // Ajusta la ruta según tu estructura
import  ReservationEquipments from './models/ReservationEquipment.js';
schedule.scheduleJob('0 * * * *', async () => {
    try {
        const currentTimestamp = new Date();

        // Eliminar las reservas vencidas para libros
        await ReservationBooks.deleteMany({
            deleteScheduled: { $lt: currentTimestamp },
        });

        // Eliminar las reservas vencidas para equipos
        await ReservationEquipments.deleteMany({
            deleteScheduled: { $lt: currentTimestamp },
        });

        console.log('Tarea programada: Reservas eliminadas');
    } catch (error) {
        console.error('Error en la tarea programada:', error);
    }
});
