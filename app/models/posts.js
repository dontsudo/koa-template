import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import idPlugin from 'mongoose-id';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: null,
    },
  },
  { autoCreate: true },
);

const index = {
  title: 'text',
  details: 'text',
};
postSchema.index(index);

postSchema.plugin(mongoosePaginate);
postSchema.plugin(idPlugin);

const Post = mongoose.model('Post', postSchema);

export default Post;
