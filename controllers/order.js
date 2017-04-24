//Load module dependencies
var EventEmitter = require('events').EventEmitter;
var crypto       = require('crypto');
var debug        = require('debug')('api:controller-order');
var moment       = require('moment');
var request      = require('request');

var config       = require('../config');
var orderDal     = require('../dal/order');
var CustomError  = require('../lib/custom-error');

/**
 * create an order
 * 
 * @desc create a new order and add it to the database
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next middleware dispatcher 
 */
exports.createOrder = (req, res, next) => {
    debug('creating an order');

    var workflow = new EventEmitter();
    var body = req.body;

    workflow.on('createOrder', function validateorder() {
        orderDal.create(body, function createcb(err, order){
            if(err){ return next(err);}

            workflow.emit('respond', order);
        });
        workflow.on('respond', function respond(order){
            res.status(201).json(order);
        });
    });
    workflow.emit('createOrder');
};

/**
 * Get one order
 * 
 * @desc Fetch a single order from the database by Id
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next middleware dispatcher 
 */
exports.fetchOne = function GetOneOrder(req, res, next){
    debug('Fetching order:', req.params._id);

    var query = { _id: req.params._id };

    orderDal.get(query, function getcb(err, order) {
        if(err) {
            return next(CustomError({
                name: 'SERVER_ERROR',
                message: err.message
            }));
        };
        res.json(order);
    });
};
/**
 * Update the order
 * 
 * @desc Get a single order from the database and update their data
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next middleware dispatcher 
 */
exports.updateOrder = (req, res, next) => {
    debug('updating order:', req.params._id);

    var query = { _id: req.params._id };
    var body = req.body;

    orderDal.update(query, body, function updatecb(err, order) {
        if(err) {
            return next(CustomError({
                name: 'SERVER_ERROR',
                message: err.message
            }));
        };
        res.json(order);
    });
};

/**
 * delete a single order
 * 
 * @desc Get a single order from the database and delete their data.
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next middleware dispatcher 
 */
exports.delete = (req, res, next) => {
    debug('deleting order:', req.params._id);

    var query = { _id: req.params._id };

    orderDal.delete(query, function deletecb(err, order) {
        if(err) {
            return next(CustomError({
                name: 'SERVER_ERROR',
                message: err.message
            }));
        };
        res.json(order);
    });
};

/**
 * Get a collection of orders
 * 
 * @desc Get a collection of orders from the database
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next middleware dispatcher 
 */
exports.getOrders = (req, res, next) => {
    debug('Fetching all orders');

    var query = {};
    orderDal.getCollection(query, function getOrderCollections(err, orders) {
        if(err) {
            return next(CustomError({
                name: 'SERVER_ERROR',
                message: err.message
            }));
        };
        res.json(orders);
    });
};

/**
 * Get a collection of orders by pagination
 * 
 * @desc Get a collection of orders from the database by pagiation
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next middleware dispatcher 
 */
exports.fetchAllByPagination = function fetchAllOrders(req, res, next) {
  debug('get a collection of orders by pagination');

  // retrieve pagination query params
  var page   = req.query.page || 1;
  var limit  = req.query.per_page || 10;

  var opts = {
    page: page,
    limit: limit
  };
  var query = {};

  orderDal.getCollectionByPagination(query, opts, function cb(err, orders) {
    if(err) {
        return next(CustomError({
            name: 'SERVER_ERROR',
            message: err.message
        }));
    };
    res.json(orders);
  });
};

/**
* 
*/
exports.getSame = function getSame(req, res, next){
    //Get all orders from the db
    orderDal.getCollection({}, function getcb(err, orders){
        if(err){ return next(err);}

        for (var i = 0; i < orders.length; i++){
            var obj = orders[i];

            //Get the date orders were placed.
            var date1 = orders[i].date_created;
            var date2 = orders[i+1].date_created;
            var time_diff = moment.utc(moment(date1,"HH:mm:ss").diff(moment(date2,"HH:mm:ss"))).format("HH:mm:ss");
            
            //Convert time difference to float value
            function timeStringToFloat(time) {
                var hoursMinutes = time.split(/[.:]/);
                var hours = parseInt(hoursMinutes[0], 10);
                var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
                return hours + minutes / 60;
            }
            var time_taken = (timeStringToFloat(time_diff));

            if(time_taken<60){
                //Verify that sender location for both orders match
                if (orders[i].sender_location === orders[i+1].sender_location){
                    //Verify that recipient location for both orders match
                    if(orders[i].recipient_location ===orders[i+1].recipient_location){
                        res.json(orders[i]+'and'+ orders[i+1]+'can be delivered together!');
                    }else{
                        //Get the route of one order
                        request.get('https://maps.googleapis.com/maps/api/directions/json?origin='+orders[i+1].sender_location+'&destination='+orders[i+1].recipient_location+'&key=AIzaSyDGEdk2jCCAxznoa9SvkmrJOlx2y_TUccU', function(error, response, body){
                            console.log(error);
                            console.log(response.statusCode);
                            console.log(body);
                        });

                        //If the coordinates of order[i] fall on the route of order[i+1], then return both orders
                        if(orders[i].recipient_long1 === body.routes.start_location.lng) && ( orders[i].recipient_lat === body.routes.end_location.lat){
                            res.json(orders);
                        };
                    }; 
                }else{
                    res.json(orders[i]+'and'+ orders[i+1]+'dont match');
                };
            }; 
        };
    });
};

//search for locations with same pickup and drop-off points
exports.search = function search(req, res, next){
    if(req.query.search){
        var regex = new RegExp(escapeRegExp(req.query.search), 'gi');
        var query = {sender_location:regex} && { recipient_location};
            orderDal.getCollection(query, function getOrdersCollections(err, orders){
                if(err){return next(err);}
                res.json(orders);
            });
        }
    };
function escapeRegExp(string){
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};