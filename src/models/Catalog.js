const { Schema, model } = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const catalogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'product'
      }
    ]
  },
  {
    timestamps: true
  }
);

catalogSchema.plugin(aggregatePaginate);
module.exports = model('catalog', catalogSchema);
