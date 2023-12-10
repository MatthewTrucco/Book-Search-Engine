const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('../config/connection'); // Adjusted path
const { typeDefs, resolvers } = require('../schemas'); // Adjusted path
const authMiddleware = require('../utils/auth'); // Adjusted path
const helmet = require('helmet'); // Import helmet

const app = express();
const PORT = process.env.PORT || 3001;

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

// Helmet middleware to set CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "<URLs where scripts are hosted>"],
      styleSrc: ["'self'", "'unsafe-inline'", "<URLs where styles are hosted>"],
      imgSrc: ["'self'", "<URLs where images are hosted>"],
      connectSrc: ["'self'", "<URLs for APIs>"],
      fontSrc: ["'self'", "<URLs where fonts are hosted>"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      // Add other directives as needed
    },
  })
);

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'dist' directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Favicon handling (if you have a favicon.ico, place it in the 'client/dist' folder)
app.get('/favicon.ico', (req, res) => {
  // You can send a 204 No Content status if you don't have a favicon.ico
  res.status(204).send();
  // Or if you have a favicon.ico, you can uncomment the following line:
  // res.sendFile(path.resolve(__dirname, '../client/dist/favicon.ico'));
});

// Catch-all route to serve the main index.html file
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});

// Start Apollo Server
async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
}

startApolloServer();
