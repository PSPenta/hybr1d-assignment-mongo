const { Schema, model } = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const orderSchema = new Schema(
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

orderSchema.plugin(aggregatePaginate);
module.exports = model('order', orderSchema);
