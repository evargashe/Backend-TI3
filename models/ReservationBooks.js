import mongoose from "mongoose";
import generateRandomAlphaNumeric from "../helpers/generateCodVal.js";

const reservationBookSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    type: {
      type: String,
      enum: ["book"],
      default: "book",
    },
    verificationCode: {
      type: String,
      default: () => generateRandomAlphaNumeric(8)
    },
    reservationDate: {
      type: Date,
      default: Date.now(),
    },
    returnDate: {
      type: Date,
      default: Date.now(),
    },
    duration: {
      type: Date,
      default: Date.now()
    },
    state: {
      type: String,
      required: true
    },
    deleteScheduled: {
      type: Date,
      default: null,
    },
    currentTime: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

const ReservationBook = mongoose.model("ReservationBook", reservationBookSchema);

export default ReservationBook;
