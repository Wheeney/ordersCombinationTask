/**
 * Load module dependencies
 */
var debug      = require('debug')('api:dal-order');
var moment     = require('moment');
var Order    = require('../models/order');
var population = [{ path:'user'}];
var returnFields = Order.whitelist;

/**
 * create a order
 * 
 * @desc create a new order and save the data in the database 
 * @param {object} orderData  data for the order being created.
 * @param {function} cb  callback for once the order has been created
 */
exports.create = function create(orderData, cb){
    debug('Creating a new order');

    //create a new order
    var newOrder = new Order(orderData);

    newOrder.save(function saveOrder(err, order){
        if(err){
            return cb(err);
        };

        exports.get({_id: order._id}, function(err, order){
            if (err){
                return cb(err)
            };
            cb(null, order);
        });
        return;

    });
};


/**
 * Delete a order
 * 
 * @desc delete data of the order with the given id 
 * @param {object} query  Query object
 * @param {function} cb  callback for once delete is complete
 */
exports.delete = (query, cb)=>{
    debug('deleting order:', query);

    var Promise = Order.findOne(query).populate(population).exec()
    .then(order=>{
        if(!order){ return cb(null, {});}

        order.remove(order=>{ return cb(null, order);
        })
        .catch(err=>{ return cb(err);
        });
    });
};


/**
 * update a order
 * @desc update data of a order with a given id
 * 
 * @param {object} query  Query object
 * @param {object} updates update data
 * @param {function} cb  callback for once update is complete
 */
exports.update = (query, updates, cb)=>{
    debug('updating order:', query);

    var now = moment().toISOString();
    updates.last_modified = now;

    var Promise = Order.findOneAndUpdate(query, updates).populate(population).exec()
    .then(order=>{ return cb(null, order);
    })
    .catch(err=>{ return cb(err);
    });
};


/**
 * Get a order
 * 
 * @desc get a order with a specific id from db 
 * @param {object} query  Query object
 * @param {function} cb  callback for once fetch is complete
 */
exports.get = (query, cb)=>{
    debug('fetching order:', query);

    var Promise = Order.findOne(query).populate(population).exec()
    .then(order=>{ return cb(null, order || {});
    })
    .catch(err=>{ return cb(err);
    });
};


/**
 * Get a collection of orders
 * 
 * @desc Get a collection of orders from the database 
 * @param {object} query  Query object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.getCollection = (query, cb)=>{
    debug('Getting a collection of orders');

    var Promise =Order.find(query).populate(population).exec()
    .then(orders=>{ return cb(null, orders);
    })
    .catch(err=>{ return cb(err);
    });
};


/**
 * Get a collection of orders by pagination
 * 
 * @desc Get a collection of orders from the database by pagination
 * @param {object} query  Query object
 * @param {object} opts  options object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.getCollectionByPagination = function getCollection(query, opts, cb) {
  debug('fetching a collection of orders');

  var opts = {
    columns:  returnFields,
    sortBy:   opts.sort || {},
    populate: population,
    page:     opts.page,
    limit:    opts.limit
  };

  Order.paginate(query, opts, function (err, docs, page, count) {
    if(err) { return cb(err);}

    var data = {
      total_pages: page,
      total_docs_count: count,
      docs: docs
    };
    cb(null, data);
  });
};

//Aggregation
exports.getMatching = function getMatching(query, cb){
    var Promise =Order.aggregate(query).exec()
    .then(orders=>{ return cb(null, orders);
    })
    .catch(err=>{ return cb(err);
    });
}
