import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true,
        trim: true
    },    
    amount:{
        type: Number,
        require: true
    },
    components:{
        type: String,
        require: true
    },
    state:{
        type: String,
        require: true
    },

});

const Equipment = mongoose.model('Equipments', equipmentSchema);



export default Equipment;