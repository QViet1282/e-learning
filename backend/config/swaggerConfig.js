const swaggerJSDoc = require('swagger-jsdoc');

const os = require('os');

// Lấy danh sách các network interfaces
const networkInterfaces = os.networkInterfaces();

// Lấy địa chỉ IP đầu tiên không phải là `localhost`
const getLocalIpAddress = () => {
  for (const interfaceKey in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceKey];
    for (const address of networkInterface) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return '127.0.0.1'; // fallback nếu không tìm thấy IP nào
};

const ipAddress = getLocalIpAddress();
console.log('Server IP:', ipAddress);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://${ipAddress}:3000`, 
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
