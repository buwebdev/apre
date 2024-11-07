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

//Test Suite for Sales By Product API
describe('Apre Sales Report API - Sales By Product', () => {
  beforeEach(() => {
    mongo.mockClear();
  });
  //Test for returned sales data for product
  it('should return sales data for product', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              product: 'Fitness Tracker',
              totalSales: '300'
            }
          ])
        })
      };
      await callback(db);
    });
 
    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/products/Fitness%20Tracker');
 
    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        product: 'Fitness Tracker',
        totalSales: '300'
      }
    ]);
  });
 
  //Test for returning an empty array if no sales data is found for a product
  it('should return an empty array and 200 status if no sales data is found for product', async () => {
    //Mock the mongoDB implementation
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
    const response = await request(app).get('/api/reports/sales/products/Fake%20Product');
 
    //Expected response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
 
 
  //Test for returned product and totalSales fields
  it('should return data with product and totalSales fields', async () => {
    //Mock implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              product: 'Smart Watch',
              totalSales: '4300'
            }
          ])
        })
      };
      await callback(db);
    });
 
    //Make request to the endpoint
    const response = await request(app).get('/api/reports/sales/products/Smart%20Watch');
    const data = response.body[0];
 
    //Expected response
    expect(data).toHaveProperty('product');
    expect(data).toHaveProperty('totalSales');
  });
 
});

// Test the sales report API that fetches sales by customer and salesperson
describe('Apre Sales Report API - Sales by Customer and Salesperson', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/customers-salespeople/:customer&:salesperson endpoint
  it('should fetch sales data for a specific customer and salesperson', async () => {
    mongo.mockImplementation(async (callback) => {
      // Mock the MongoDB collection
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              product: 'Gaming Console',
              category: 'Electronics',
              saleAmount: 500
            }
          ])
        })
      };
      await callback(db);
    });

    // Send a GET request to the sales/customers-salespeople/:customer&:salesperson
    const response = await request(app).get('/api/reports/sales/customers-salespeople/Epsilon%20Ltd&David%20Wilson');
    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        product: 'Gaming Console',
        category: 'Electronics',
        saleAmount: 500
      }
    ]);
  });

  // Test the sales/customers-salespeople/unknown-customer&unknown-salesperson endpoint
  it('should return 200 and an empty array if no sales data is found for the customer and salesperson', async () => {
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
    const response = await request(app).get('/api/reports/sales/customers-salespeople/unknown-customer&unknown-salesperson');

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test the sales/customers-salespeople/wrong-customer endpoint
  it('should return 404 for an invalid endpoint', async () => {
    // Make a request to an invalid endpoint
    const response = await request(app).get('/api/reports/sales/customers-salespeople/Mark Clark');

    // Assert the response
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});

// Test the sales report by category API, three tests in suite
describe('Apre Sales Report API - Category', () => {
  beforeEach(() => {
    mongo.mockClear();
  });
 
  // Test the sales/categories endpoint
  it('should fetch a list of distinct sales categories', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue(['Electronics', 'Furniture', 'Accessories', 'Wearables', 'Home Appliances', 'Personal Care'])
      };
      await callback(db);
    });
 
    const response = await request(app).get('/api/reports/sales/categories'); // Send a GET request to the sales/categories endpoint
 
    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual(['Electronics', 'Furniture', 'Accessories', 'Wearables', 'Home Appliances', 'Personal Care']); // Expect the response body to match the expected data
  });
 
  // Test the sales/categories for an invalid endpoint
  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/sales/categoories'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404); // Expect a 404 status code
 
    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
 
  // Test the sales/categories endpoint with no regions found
  it('should return 200 with an empty array if no categories are found', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    });
 
    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/categories');
 
    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual([]); // Expect the response body to match the expected data
  });
});