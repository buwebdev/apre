/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 *
 * Feat(): 11/02/2024 added tests for sales reports by year-(M064)- Bernice Templeman
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

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

/* 
 * GET /sales-by-year
 *
 * Fetches sales data for a specific year, grouped by salesperson.
 *
 * Example:
 * fetch('/sales-by-year?year=2023')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 *
 */
router.get("/sales-by-year", (req, res, next) => {
  try {
    const { year } = req.query;

    if (!year) {
      return next(createError(400, "year is required"));
    }

    mongo(async (db) => {
      const data = await db
        .collection("sales")
        .aggregate([
          {
            $group: {
              _id: {
                salesperson: "$salesperson",
                year: { $year: "$date" },
              },
              totalSales: { $sum: "$amount" },
            },
          },

          { $match: { "_id.year": Number(year) } },

          {
            $project: {
              _id: 0,
              salesperson: "$_id.salesperson",
              totalSales: 1,
            },
          },

          {
            $sort: { salesperson: 1 },
          },
        ])
        .toArray();
      res.send(data);
    }, next);
  } catch (err) {
    console.error("Error getting sales data for year: ", err);
    next(err);
}
  
/*
 * GET /monthly/
 *
 * Fetches sales data for a specific month and year
 *
 * Example:
 * fetch('monthly?month=9&year=2023')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/monthly', (req, res, next) => {
  // Get the month and year from the query string
  let { month, year } = req.query;

  // If the month or the year are not specified
  if(!month || !year) {
    return next(createError(400, 'Month and year are required')); // return 400 error with 'Month and year are required' message
  }

  // If the month is less than 1 or greater than 12
  if(month < 1 || month > 12) {
    return next(createError(400, 'Month must be a number between 1 and 12')); // return 400 error with 'Month must be a number 1 through 12' message
  }

  // JS month numbers start at zero, so the month number will be one off.
  // Subtract one from the given month to compensate for this.
  month = month - 1;

  // Date for the first day of the given month
  let firstOfTheMonth = new Date(year, month, 1);

  // Date for the last day of the given month
  // This was done with the help of this article: https://bobbyhadz.com/blog/javascript-get-first-day-of-month
  let lastDayOfMonth = new Date(year, month + 1, 0);

try {
  // Get the records from the sales data collection from the first of the month to the last day of the month
  // Data is sorted by date ascending, then converted to an array
  mongo (async db => {
    const monthlySalesData = await db.collection('sales').find({date: {$gte: firstOfTheMonth, $lte: lastDayOfMonth,}}).sort({ date: 1 }).toArray();
    res.send(monthlySalesData);
  })
} catch (err) {
  console.error('Error getting monthly sales data: ', err);
  next(err);
}
});

module.exports = router;