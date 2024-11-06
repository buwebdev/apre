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

// Testing Sales by Customer endpoint with valid and invalid customer names
describe('Apre Sales Report API - Sales by Customer', () => {
  // Set up the default behavior for the mongo mock before each test
  beforeEach(() => {
    // Mock the mongo function to return an object with the required methods
    mongo.mockImplementation(async (callback) => {
      const collectionMock = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        }),
        distinct: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      return await callback({ collection: jest.fn(() => collectionMock) });
    });
  }); 

  // Test case: Should return 404 for an invalid customer name
  it('should fetch sales data for a specific customer', async () => {
    mongo.mockImplementationOnce(async (callback) => {
      const collectionMock = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { customer: 'Lambda LLC', amount: 100 },
            { customer: 'Chi Co', amount: 300 }
          ])
        })
      };
      return await callback({ collection: jest.fn(() => collectionMock) });
    });
  
    const response = await request(app).get('/api/reports/sales/customer/Lambda LLC');
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { customer: 'Lambda LLC', amount: 100 },
      { customer: 'Chi Co', amount: 300 }
    ]);
  });  

  // Test case: Should return 200 with an empty array if no sales data is found for the customer
  it('should return 200 with an empty array if no sales data is found for the customer', async () => {
    const response = await request(app).get('/api/reports/sales/customer/nonexistent_customer');
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });  
  
  // Test case: Should return 500 if there is a database error
  it('should return 500 if there is a database error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    mongo.mockImplementationOnce(async () => {
      throw new Error('Database error');
    });
  
    const response = await request(app).get('/api/reports/sales/customer/Lambda LLC');
  
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Error fetching sales data',
      error: expect.any(Object)
    });
  
    consoleErrorSpy.mockRestore();
  });  

  // Test case: Should return 404 for an invalid endpoint
  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/sales/invalid-endpoint');
  
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });  
});