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
});

module.exports = router;