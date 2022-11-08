import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import idPlugin from 'mongoose-id';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    key: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['superuser', 'user', 'create', 'update', 'delete'],
    },
  },
  { autoCreate: true },
);

const index = {
  name: 'text',
  email: 'text',
};
userSchema.index(index);

userSchema.plugin(mongoosePaginate);
userSchema.plugin(idPlugin);

const User = mongoose.model('User', userSchema);

export default User;
