/**
 * Author: Professor Krasso
 * Date: 10 September 2024
 * File: index.spec.js
 * Description: Test the sales report API
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

// Test the sales report API
describe('Apre Sales Report API - Regions', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions endpoint
  it('should fetch a list of distinct sales regions', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue(['North', 'South', 'East', 'West'])
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/regions'); // Send a GET request to the sales/regions endpoint

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual(['North', 'South', 'East', 'West']); // Expect the response body to match the expected data
  });

  // Test the sales/regions endpoint with no regions found
  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/sales/invalid-endpoint'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404); // Expect a 404 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test the sales/regions endpoint with no regions found
  it('should return 200 with an empty array if no regions are found', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/regions');

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual([]); // Expect the response body to match the expected data
  });
});

// Test the sales report API
describe('Apre Sales Report API - Sales by Region', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions/:region endpoint
  it('should fetch sales data for a specific region, grouped by salesperson', async () => {
    mongo.mockImplementation(async (callback) => {
      // Mock the MongoDB collection
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              salesperson: 'John Doe',
              totalSales: 1000
            },
            {
              salesperson: 'Jane Smith',
              totalSales: 1500
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/regions/north'); // Send a GET request to the sales/regions/:region endpoint
    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        salesperson: 'John Doe',
        totalSales: 1000
      },
      {
        salesperson: 'Jane Smith',
        totalSales: 1500
      }
    ]);
  });

  it('should return 200 and an empty array if no sales data is found for the region', async () => {
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
    const response = await request(app).get('/api/reports/sales/regions/unknown-region');

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 404 for an invalid endpoint', async () => {
    // Make a request to an invalid endpoint
    const response = await request(app).get('/api/reports/sales/invalid-endpoint');

    // Assert the response
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});
// Test the monthly sales data report API
describe('Apre Sales Report API - Monthly sales data', () => {
  beforeEach(() => {
    mongo.mockClear();
  });
 
// Test the monthly endpoint with missing parameters
  it('should return 400 if month and/or year are missing', async () => {
    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/monthly');
 
    // Assert the response
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Month and year are required',
      status: 400,
      type: 'error'
    });
  });
 
  // Test the monthly endpoint with an invalid month number
  it('should return 400 if month is less than 1 or greater than 12', async () => {
    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/monthly?month=0&year=2023');
 
    // Assert the response
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Month must be a number between 1 and 12',
      status: 400,
      type: 'error'
    });
  });
 
  it('should return 200 with an empty array if no sales data is found', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    })
 
    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/monthly?month=9&year=2023');
 
    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual([]); // Expect the response body to match the expected data
  });
});

// Test the sales report API: Years
describe('Apre Sales Report API - Sales by Year', () => {
  beforeEach(() => {
    mongo.mockClear();
  });
 
  // Test the sales-by-year sales/years/year endpoint
  it('should fetch sales data for a specific year, grouped by salesperson', async () => {
    mongo.mockImplementation(async (callback) => {
      // Mock the MongoDB collection
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              salesperson: 'John Doe',
              totalSales: 1000
            },
            {
              salesperson: 'Jane Smith',
              totalSales: 1500
            }
          ])
        })
      };
      await callback(db);
    });
 
    const response = await request(app).get('/api/reports/sales/sales-by-year?year=2023'); // Send a GET request to the sales/regions/:region endpoint
    expect(response.status).toBe(200); // Expect a 200 status code
 
    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        salesperson: 'John Doe',
        totalSales: 1000
      },
      {
        salesperson: 'Jane Smith',
        totalSales: 1500
      }
    ]);
  });
 
  // Test the sales-by-year endpoint with missing parameters
  it('should return 400 if the year parameter is missing', async () => {
    const response = await request(app).get('/api/reports/sales/sales-by-year'); // Send a GET request to the channel-rating-by-month endpoint with missing month
    expect(response.status).toBe(400); // Expect a 400 status code
 
    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'year is required',
      status: 400,
      type: 'error'
    });
  });
 
  // it should return 404 for invalid endpoint
  it('should return 404 for an invalid endpoint', async () => {
    // Make a request to an invalid endpoint
    const response = await request(app).get('/api/reports/sales-by-year/2');
 
    // Assert the response
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});


