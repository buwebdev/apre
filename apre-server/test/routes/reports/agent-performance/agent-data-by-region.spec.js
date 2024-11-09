/**
 * Author: Brandon Salvemini
 * Date: 7 November 2024
 * File: agent-data-by-region.spec.js
 * Description: Test the agent performance data by region API
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

// Test the agent performance data by region API
describe('Apre Agent Performance data by region API', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the region/regions endpoint
  it('should fetch a list of distinct agent performance regions', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue(['Africa','Asia','Australia','Europe','North America','South America'])
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/agent-performance/region/regions'); // Send a GET request to the region/regions endpoint

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual(['Africa','Asia','Australia','Europe','North America','South America']); // Expect the response body to match the expected data
  });

  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/agent-performance/region/'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404);
    // Expect the response data to equal the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  it('should return 200 and an empty array if no agent performance data is found for the region', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/agent-performance/region/Australiaa');

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});