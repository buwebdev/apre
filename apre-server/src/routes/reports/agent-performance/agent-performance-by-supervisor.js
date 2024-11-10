/**
 * Author: Diana Ruiz Garcia
 * Date: 11/09/24
 * File: agent-performance-by-supervisor.js
 * Description: Apre agent performance API for the agent performance report
 * by supervisor.
 */
'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const ObjectId = require('mongodb').ObjectId; // Import ObjectId

const router = express.Router();

/**
 * @description
 *
 * GET /agent-performance-by-supervisor
 *
 * Fetches a list of distinct agent performance supervisors.
 *
 * Example:
 * fetch('/agent-performance-by-supervisor')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/agent-performance-by-supervisor', (req, res, next) => {
  try {
    mongo (async db => {
      const supervisors = await db.collection('agentPerformance').distinct('supervisorId');
      res.send(supervisors);
    }, next);
  } catch (err) {
    console.error('Error getting supervisors: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /agent-performance-by-supervisor/:supervisorId
 *
 * Fetches agent performance data for a specific supervisor.
 *
 * Example:
 * fetch('/agent-performance-by-supervisor/650c1f1e1c9d440000a1b1c3')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/agent-performance-by-supervisor/:supervisorId', (req, res, next) => {
  try {
    const supervisorId = req.params.supervisorId;

    if (!supervisorId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(createError(400, 'Supervisor ID is required'));
    }

    console.log('Fetching agent performance report for supervisor:', supervisorId);

    mongo (async db => {
      const agentPerformanceReportBySupervisor = await db.collection('agentPerformance').aggregate([
        { $match: { supervisorId: new ObjectId(supervisorId) }},
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
            totalResolutionTime: { $sum: '$resolutionTime'}
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            resolutionTime: '$totalResolutionTime'
          }
        },
        {
          $group: {
            _id: null,
            agents: { $push: '$agent' },
            resolutionsTime: { $push: '$resolutionTime' }
          }
        },
        {
          $project: {
            _id: 0,
            agents: 1,
            resolutionsTime: 1
          }
        }
      ]).toArray();
      res.send(agentPerformanceReportBySupervisor);
    }, next);
  } catch (err) {
    console.error('Error getting agent performance data for supervisor: ', err);
    next(err);
  }
});

module.exports = router;