/**
 * Author: Brandon Salvemini
 * Date: 11/7/2024
 * File: agent-data-by-region.js
 * Description: Route file for fetching agent performance data by region
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
 * Fetches a list of distinct agent performance regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('agentPerformance').distinct('region');
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
 * GET /:region
 *
 * Fetches agent performance data for a given region
 *
 * Example:
 * fetch('/region/Australia')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/:region', function(req, res, next) {
  try {
    mongo (async db => {
      const agentPerformanceReportByRegion = await db.collection('agentPerformance').aggregate([
        {
          '$match': {
            'region': req.params.region // match on the given region
          }
        }, {
          '$lookup': { // lookup the agent details from the agents collection using the agentID field
            'from': 'agents',
            'localField': 'agentId',
            'foreignField': 'agentId',
            'as': 'agentDetails'
          }
        }, {
          '$addFields': {
            'agentDetails': {
              '$arrayElemAt': [
                '$agentDetails', 0 // get the first entry from the agentDetails array
              ]
            }
          }
        }, {
          '$addFields': {
            'agentDetails': {
              '$ifNull': [
                '$agentDetails', {} // if agentDetails is null, set it to an empty object
              ]
            }
          }
        }, {
          '$unset': [
            '_id', 'performanceMetrics', 'supervisorId' // Remove '_id', 'performanceMetrics', and 'supervisorId' from the result
          ]
        }
      ]).toArray();
      res.send(agentPerformanceReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting agent performance data for region: ', err);
    next(err);
  }
});

module.exports = router;