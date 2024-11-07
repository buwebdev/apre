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
  
/**
 * @description
 *
 * GET /categories
 *
 * Fetches a list of distinct sales categories.
 *
 * Example:
 * fetch('/categories')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/categories', (req, res, next) => {
  try {
    mongo (async db => {
      const categories = await db.collection('sales').distinct('category');
      res.send(categories);
    }, next);
  } catch (err) {
    console.error('Error getting categories: ', err);
    next(err);
  }
});
 
/**
 * @description
 *
 * GET /categories/:category
 *
 * Fetches sales data for a specific category, grouped by salesperson.
 *
 * Example:
 * fetch('/categories/accessories')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/categories/:category', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByCategory = await db.collection('sales').aggregate([
        { $match: { category: req.params.category } },
        {
          $group: {
            _id: '$category',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            totalSales: 1,
          }
        },
        {
          $sort: { totalSales: 1 }
        }
      ]).toArray();
      res.send(salesReportByCategory);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for category: ', err);
    next(err);
  }
});

module.exports = router;