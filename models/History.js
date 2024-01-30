import mongoose from "mongoose";

const userHistorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'itemType', // Referencia condicional al campo 'itemType'
    },
    itemType: {
      type: String,
      enum: ['Book', 'Equipment']
    },
    returnDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    state: {
      type: String,
      required: true
    },
    endHour: {
      type: String,
      default: ''
    },
    currentTime: {
      type: Date,
      required: true,
      default: Date.now(),
    }
  }
);

const userHistory = mongoose.model("userHistory", userHistorySchema);

export default userHistory;
