/**
 * Load Module Dependencies
 */
var mongoose  = require('mongoose');
var paginator = require('mongoose-paginate');
var moment    = require('moment');

var Schema    = mongoose.Schema;

// Define Order Schema
var orderSchema = new Schema({
  name     : { type: String},
  sender_name : { type: String},
  sender_location : { type: String},
  sender_lat:  { type: String},
  sender_long:  { type: String},
  recipient_name : { type: String},
  recipient_location : { type: String},
  recipient_lat:  { type: String},
  recipient_long:  { type: String},
  date_created:{ type:Date},
  last_modified:{ type:Date}

}, { versionKey: false });

/**
 * Model Attributes to expose
 */
orderSchema.statics.whitelist = {
  name:1,
  sender_name:1,
  sender_location:1,
  sender_lat:1,
  sender_long:1,
  recipient_name:1,
  recipient_location:1,
  recipient_lat:1,
  recipient_long:1,
  date_created:1,
  last_modified:1
};

//Middleware to support pagination
orderSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc Sets the date_created and last_modified attributes prior to save.
 * @param {next} next middleware dispatcher
 */
orderSchema.pre('save', function preSaveMiddleware(next) {
  var order = this;

  // set date modifications
  var now = moment().toISOString();

  order.date_created = now;
  order.last_modified = now;

  next();

});

// Export Order Model
module.exports = mongoose.model('Order', orderSchema);