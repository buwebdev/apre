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

// GET /products
//API to fetch a list of products
router.get('/products', (req, res, next) => {
  try {
    mongo (async db => {
      //Identify all products using distinct
      const products = await db.collection('sales').distinct('product');
      //send products to client
      res.send(products);
    }, next);
  } catch (err) {
    console.error('Error getting products: ', err);
    next(err);
  }
});

//GET /products/:product
//API to fetch sales data by product
router.get('/products/:product', (req, res, next) => {
  console.log(`received request for: ${req.params.product}`);
  try {
    mongo(async db => {
      const salesReportByProduct = await db.collection('sales').aggregate([
        //match specified product
        { $match: { product: req.params.product } },
        //group documents and calculate total amount
        {
          $group: {
            _id: '$product',
            totalSales: { $sum: '$amount' }
          }
        },
        //Shape resulting documents with $project
        {
          $project: {
            _id: 0,
            product: '$_id',
            totalSales: 1
          }
        },
        //sort in ascending order
        {
          $sort: { product: 1 }
        }
        //convert results to an array and send to client
      ]).toArray();
      res.send(salesReportByProduct);
    }, next);
  } catch (err) {
    console.error('Error fetching sales data by product', err);
    next(err);
  }
});

module.exports = router;