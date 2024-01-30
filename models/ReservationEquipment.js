import mongoose from "mongoose";
import generateRandomAlphaNumeric from "../helpers/generateCodVal.js";


const reservationEquipmentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },
    verificationCode: {
      type: String,
      default: () => generateRandomAlphaNumeric(8)
    },
    type: {
      type: String,
      enum: ["equipment"],
      default: "equipment",
    },
    reservationDateTime: {
      type: Date,
      default: Date.now()
    },
    startHour: {
      type: String,
      default: ''
    },
    endHour: {
      type: String,
      default: ''
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

const ReservationEquipment = mongoose.model("ReservationEquipment", reservationEquipmentSchema);

export default ReservationEquipment;
