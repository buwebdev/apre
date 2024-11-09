/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /call-duration-by-date-range
 *
 * Fetches call duration data for agents within a specified date range.
 *
 * Example:
 * fetch('/call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/call-duration-by-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Start date and end date are required'));
    }

    console.log('Fetching call duration report for date range:', startDate, endDate);

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        {
          $unwind: '$agentDetails'
        },
        {
          $group: {
            _id: '$agentDetails.name',
            totalCallDuration: { $sum: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            callDuration: '$totalCallDuration'
          }
        },
        {
          $group: {
            _id: null,
            agents: { $push: '$agent' },
            callDurations: { $push: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agents: 1,
            callDurations: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /call-duration-by-date-range', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /performance-by-metric/:metricName
 *
 * Fetches call performance data for agents by specified metric.
 *
 * Example:
 * fetch('/performance-by-metric/Sales Conversion')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/performance-by-metric/:metricName', (req, res, next) => {
  // Assign parameter to a variable for easy reference
  const metricName = req.params.metricName;

  // Surround our query in a try-catch for added safety
  try {
    mongo (async db => {
      // Query our database for data related to the desired metric
      const perfDataForMetric = await db.collection('agentPerformance').aggregate([
        // Match on the provided personName
        {
          $match: {
            performanceMetrics: {
              $elemMatch: {
                metricType: metricName
              }
            }
          }
        },
        // Lookup/join on agents
        {
          $lookup: {
            from: "agents",
            localField: "agentId",
            foreignField: "agentId",
            as: "agentDetails"
          }
        },
        // Unwind the agent details
        {
          $unwind: "$agentDetails"
        },
        // Get the agent data
        {
          $group: {
            _id: null,
            agentInfo: {
              $addToSet: {
                // Agent Name
                agentName: "$agentDetails.name",
                // Sum the performance data for the desired metric
                performanceTotals: {
                  // Obtain the performance total so that it is not an array
                  $arrayElemAt: [
                    {
                      // Create an array of the desired metric
                      $map: {
                        input: {
                          // Filter to get the sub-documents of the desired metric
                          $filter: {
                            input:
                              "$performanceMetrics",
                            as: "aMetric",
                            cond: {
                              $eq: [
                                "$$aMetric.metricType",
                                metricName
                              ]
                            }
                          }
                        },
                        as: "desiredMetric",
                        in: {
                          // Total up the performance values of the desired metric
                          $sum: "$$desiredMetric.value"
                        }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        },
        // Project the two arrays
        {
          $project: {
            agentNames: "$agentInfo.agentName",
            performanceTotals: "$agentInfo.performanceTotals"
          }
        }


      ]).toArray();
      // Send our results to the response
      res.send(perfDataForMetric);
    }, next);

  } catch (err) {
    // Log the error
    console.error('Error getting performance data by metric', err);
    // Pass our error object to the next middleware
    next(err);
  }
});

module.exports = router;