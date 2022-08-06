const { Schema, model } = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    catalogId: {
      type: Schema.Types.ObjectId,
      ref: 'catalog',
      required: true
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'order'
      }
    ]
  },
  {
    timestamps: true
  }
);

productSchema.plugin(aggregatePaginate);
module.exports = model('product', productSchema);
