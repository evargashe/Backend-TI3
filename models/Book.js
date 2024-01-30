import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true,
        trim: true
    },
    year:{
        type: Number,
        require: true
    },
    edition:{
        type: String,
        require: true
    },
    editorial:{
        type: String,
        require: true
    },
    'author(s)':{
        type: String,
        require: true
    },
    category:{
        type: String,
        require: true
    },
    amount:{
        type: Number,
        require: true
    },
    language:{
        type: String,
        require: true
    },
    state:{
        type: String,
        require: true
    }

});

const Book = mongoose.model('Book', bookSchema);



export default Book;