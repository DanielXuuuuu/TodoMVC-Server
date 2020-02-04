const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  nickname: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  historyNumber:{
    type: Number,
    default: 0,
  },
  completedNumber:{
    type: Number,
    default: 0,
  },
  todos: [
    {
      text: String,
      completed: {
        type: Boolean, 
        default: false
      }
    }
  ] 
},{
  versionKey: false
});

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;