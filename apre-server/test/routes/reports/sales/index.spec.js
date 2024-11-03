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

// Test suite for the sales report API to fetch an array of distinct salesperson
describe('Apre Sales Report API - Salespeople', () => {
  // Clear our mock before each test
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/salespeople endpoint to return a 404 if the endpoint is invalid
  it('should return a 404 for an invalid endpoint', async() => {
    // Send a GET request to the misspelled endpoint
    const response = await request(app).get('/api/reports/sales/salespeopled');

    // Expect to receive a status code of 404
    expect(response.status).toBe(404);

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test the sales/salespeople endpoint to return an array of distinct salesperson
  it('should fetch a list of distinct salesperson', async () => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue(['James Brown', 'John Doe', 'Emily Davis', 'Jane Smith'])
      };
      await callback(db);
    });

    // Send a GET request to the sales/salespeople endpoint
    const response = await request(app).get('/api/reports/sales/salespeople');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response body to match the expected data
    expect(response.body).toEqual(['James Brown', 'John Doe', 'Emily Davis', 'Jane Smith']);
  });

  // Test the sales/salespeople endpoint with no salesperson found
  it('should return 200 with an empty array if no salesperson is found', async () => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    });

    // Send a GET request to the sales/salespeople endpoint
    const response = await request(app).get('/api/reports/sales/salespeople');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response to be an empty array
    expect(response.body).toEqual([]);
  });
});

// Test suite for the sales report API to return Sales Data by Salesperson
describe('Apre Sales Report API - Sales by Salesperson', () => {
  // Clear our mock before each test
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/salespeople endpoint to return a 404 if the endpoint is invalid
  it('should return a 404 for an invalid endpoint', async() => {
    // Send a GET request to the misspelled endpoint
    const response = await request(app).get('/api/reports/sales/salespeopled/John Smith');

    // Expect to receive a status code of 404
    expect(response.status).toBe(404);

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // It should return a 200 status code and an empty array if no sales data is found
  it('should return a 200 status code and an empty array if no sales data is found for the salesperson', async () => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      await callback(db);
    });

    // Send a GET request to the /sales/salespeople/:personName endpoint using the value of Great Pumpkin
    const response = await request(app).get('/api/reports/sales/salespeople/Great Pumpkin');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response to be an empty array
    expect(response.body).toEqual([]);
  });

  // It should return a 200 status code and an empty array if no sales data is found
  it('should return a 200 status code and an array of sales data for the salesperson', async () => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              "category": "Furniture",
              "channel": "Online",
              "region": "East",
              "salesCount": 1,
              "totalAmount": 300
            },
            {
              "category": "Electronics",
              "channel": "Retail",
              "region": "North",
              "salesCount": 2,
              "totalAmount": 2400
            },
            {
              "category": "Accessories",
              "channel": "Online",
              "region": "South",
              "salesCount": 4,
              "totalAmount": 200
            }
          ])
        })
      };
      await callback(db);
    });

    // Send a GET request to the sales/salespeople/:personName endpoint using the value of Roger Rabbit
    const response = await request(app).get('/api/reports/sales/salespeople/Roger Rabbit');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response to be an empty array
    expect(response.body).toEqual([
      {
        "category": "Furniture",
        "channel": "Online",
        "region": "East",
        "salesCount": 1,
        "totalAmount": 300
      },
      {
        "category": "Electronics",
        "channel": "Retail",
        "region": "North",
        "salesCount": 2,
        "totalAmount": 2400
      },
      {
        "category": "Accessories",
        "channel": "Online",
        "region": "South",
        "salesCount": 4,
        "totalAmount": 200
      }
    ]);
  });
});