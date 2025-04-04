import mongoose from "mongoose";

// Create a Counter Schema: This schema will keep track of the last used number for tasks and subtasks.


const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequenceValue: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;