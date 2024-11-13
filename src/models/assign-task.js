
const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: Date,
    ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ngo" ,
        required: true,
      },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;