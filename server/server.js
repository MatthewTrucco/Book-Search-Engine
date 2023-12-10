const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const authMiddleware = require('./utils/auth');
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
      defaultSrc: ["'self'"], // default to self for all content
      scriptSrc: ["'self'", 'https://trusted-script-source.com'], // Allow scripts from these sources
      styleSrc: ["'self'", 'https://trusted-style-source.com', "'unsafe-inline'"], // Allow styles from these sources
      imgSrc: ["'self'", 'https://trusted-image-source.com'], // Allow images from these sources
      connectSrc: ["'self'", 'https://trusted-api-source.com'], // Allow connections to these sources for XHR, WebSockets, and EventSource
      fontSrc: ["'self'", 'https://trusted-font-source.com'], // Allow fonts from these sources
      objectSrc: ["'none'"], // Allow plugins (Flash, Silverlight, etc.)
      mediaSrc: ["'self'"], // Allow media from self
      frameSrc: ["'self'"], // Allow iFrames from self
      // Add additional directives as needed
    },
    reportOnly: false, // Set to true if you want to only report violations
  })
);

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Start Apollo Server
async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
}

startApolloServer();
