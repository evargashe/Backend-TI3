// Importa la función v4 de uuid
import { v4 as uuidv4 } from 'uuid';

const generateRandomAlphaNumeric = (length) => {
    // Genera un nuevo UUID (v4)
    const uniqueId = uuidv4();
    // Toma solo la longitud deseada del UUID
    const code = uniqueId.slice(0, length);
    return code;
};

export default generateRandomAlphaNumeric;
