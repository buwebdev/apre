/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('sales').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error getting regions: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions/:region', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByRegion = await db.collection('sales').aggregate([
        { $match: { region: req.params.region } },
        {
          $group: {
            _id: '$salesperson',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            salesperson: '$_id',
            totalSales: 1
          }
        },
        {
          $sort: { salesperson: 1 }
        }
      ]).toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for region: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /customers
 *
 * Fetches a list of distinct sales customers.
 *
 * Example:
 * fetch('/customers')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/customers', (req, res, next) => {
  try {
    mongo (async db => {
      const customers = await db.collection('sales').distinct('customer');
      res.send(customers);
    }, next);
  } catch (err) {
    console.error('Error getting customers: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /salespeople
 *
 * Fetches a list of distinct sales salespeople.
 *
 * Example:
 * fetch('/salespeople')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/salespeople', (req, res, next) => {
  try {
    mongo (async db => {
      const salespeople = await db.collection('sales').distinct('salesperson');
      res.send(salespeople);
    }, next);
  } catch (err) {
    console.error('Error getting salespeople: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /customers-salespeople/:customer&:salesperson
 *
 * Fetches sales data by customer and salesperson.
 *
 * Example:
 * fetch('/customers-salespersons/epsilon-ltd&David+Wilson')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/customers-salespeople/:customer&:salesperson', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByCustomerSalesPerson = await db.collection('sales').aggregate([
        { $match: { customer: req.params.customer, salesperson: req.params.salesperson } },
        {
          $group: {
            _id: '$_id',
            product: { '$first': '$product' },
            category: { '$last': '$category' },
            saleAmount: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            product: '$product',
            category: '$category',
            saleAmount: 1
          }
        },
        {
          $sort: { product: 1 }
        }
      ]).toArray();
      res.send(salesReportByCustomerSalesPerson);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for customer and salesperson: ', err);
    next(err);
  }
});

module.exports = router;