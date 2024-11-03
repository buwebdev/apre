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
 * GET /salespeople
 *
 * Fetches a list of distinct salesperson from the sales collection
 *
 * Example:
 * fetch('/salespeople')
 *  .then(response => response.json())
 *  .then(data => console.log(data))
 */
router.get('/salespeople', (req, res, next) => {
  // Surround our query in a try-catch for added safety
  try {
    mongo (async db => {
      // Query our database for an array of distinct salesperson
      const salespeople = await db.collection('sales').distinct('salesperson');
      // Send our results to the response
      res.send(salespeople);
    }, next);
  } catch (err) {
    // Log the error
    console.error('Error getting distinct salesperson', err);
    // Pass our error object to the next middleware
    next(err);
  }
});

/**
 * @description
 *
 * GET /salespeople/:salesPersonName
 *
 * Fetches sales data for a specific salesperson
 * Grouped by category, channel, and region
 *
 * Array contains
 *  category
 *  channel
 *  region
 *  salesCount
 *  totalAmount
 *
 * Example:
 * fetch('/salespeople/john doe')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/salespeople/:personName', (req, res, next) => {
  // Surround our query in a try-catch for added safety
  try {
    mongo (async db => {
      // Query our database for an array of distinct salesperson
      const salesDataForSalesPerson = await db.collection('sales').aggregate([
        // Match on the provided personName
        { $match: { salesperson: req.params.personName } },
        // Group our data
        {
          $group: {
            _id: {
              category: '$category',
              channel: '$channel',
              region: '$region'
            },
            salesCount: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        // Create an object to project the required fields
        {
          $project: {
            _id: 0,
            category: '$_id.category',
            channel: '$_id.channel',
            region: '$_id.region',
            salesCount: 1,
            totalAmount: 1
          }
        },
        // Sort by category
        { $sort: { category: 1 } }
      ]).toArray();
      // Send our results to the response
      res.send(salesDataForSalesPerson);
    }, next);
  } catch (err) {
    // Log the error
    console.error('Error getting sales data for salesperson', err);
    // Pass our error object to the next middleware
    next(err);
  }
});

module.exports = router;