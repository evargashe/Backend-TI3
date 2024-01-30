import mongoose from "mongoose";

const connectionDB = async () =>{
    try {
/*         
            console.log("MongoDB URI:", process.env.MONGO_URI); // Agrega esta línea
 */        const db = await mongoose.connect(process.env.MONGO_URI,{
            //pnouMkNZ1GDKKbpG
            /* useNewUrlParser: true,
            useUnifiedTopology: true */
        });

        const url = `${db.connection.host}:${db.connection.port}`;
        console.log(`MongoDB conectado en ${url}`)

    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}

export default connectionDB;