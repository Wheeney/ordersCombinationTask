// Load Module Dependencies
var express   =   require('express');

var order     = require('../controllers/order');

// Create a Router
var router = express.Router();

//create /orders/create
router.post('/create', order.createOrder);

//Get collection /orders/all
router.get('/all', order.getOrders);

//search order /orders
router.get('/', order.search);

//Get /orders/match
router.get('/match', order.getSameDeliveries);

//Get /orders/pages
router.get('/pages', order.fetchAllByPagination);

//Get orders/orderId
router.get('/:_id', order.fetchOne);

//Put orders/orderId
router.put('/:_id', order.updateOrder);

//Delete orders/orderId
router.delete('/:_id', order.delete);

// Export Router
module.exports = router;
