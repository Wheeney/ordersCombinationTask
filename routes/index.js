// Load Module Dependencies
var express       = require('express');
var orderRouter   = require('./order');

// Export Router Initializater
module.exports = function initRouter(app) {

  //Order Endpoint
  app.use('/orders', orderRouter);
  
};