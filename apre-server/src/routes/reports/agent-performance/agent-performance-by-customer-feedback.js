/**
 * Author: Kylie Struhs
 * Date: 11/10/24
 * File: agent-performance-by-customer-feedback.js
 * Description: Apre agent performance API for the agent performance reports of customer feedback
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /agent-id
 *
 * Fetches agent ids
 *
 * Example:
 * fetch('/agent-id')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/agent-id', (req, res, next) => {
  try {
    mongo(async db => {
      const agentIds = await db.collection('agentPerformance').distinct('agentId');
      res.send(agentIds);
    }, next);
  } catch (err) {
    console.error('Error getting agentId: ', err);
    next(err);
  }
});


/**
 * @description
 *
 * GET /agent-performance-by-customer-feedback
 *
 * Fetches customer feedback data for agents
 *
 * Example:
 * fetch('/agent-performance-by-customer-feedback')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/agent-performance-by-customer-feedback/:agentId', (req, res, next) => {
  try {
    const { agentId } = req.params;
    console.log('AgentId: ', agentId);

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $match: {
            'agentId': parseInt(agentId)
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
            _id: '$agentId',
            agentName: '$agentDetails.agent',
            feedbackScores:{ $push:'$customerFeedback'}
          }
        },
        {
          $project: {
            _id: 0,
            agentName: '$agentName',
            feedbackScores: '$feedbackScores'
          }
        },
      ]).toArray();
      console.log('Feedback data:', data);
      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /agent-performance-by-customer-feedback', err);
    next(err);
  }
});

module.exports = router;