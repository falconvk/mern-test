import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import 'babel-polyfill';
import SourceMapSupport from 'source-map-support';
import path from 'path';

import Issue from './issue';

SourceMapSupport.install();

const app = express();
app.use(express.static('static'));
app.use(bodyParser.json());

// if (process.env.NODE_ENV !== 'production') {
//   console.log('+++ setting up server HMR +++')
//   const webpack = require('webpack');
//   const webpackDevMiddleware = require('webpack-dev-middleware');
//   const webpackHotMiddleware = require('webpack-hot-middleware');
//
//   const config = require('../webpack.config');
//   config.entry.app.push('webpack-hot-middleware/client', 'webpack/hot/only-dev-server');
//   config.plugins.push(new webpack.HotModuleReplacementPlugin());
//
//   const bundler = webpack(config);
//   app.use(webpackDevMiddleware(bundler, { noInfo: true }));
//   app.use(webpackHotMiddleware(bundler, { log: console.log }));
// }

let db;
MongoClient.connect('mongodb://localhost/issuetracker')
  .then((connection) => {
    db = connection;
    app.listen(3000, () => {
      console.log('App started on port 3000');
    });
  })
  .catch(err => console.log('ERROR ', err));

app.get('/api/issues', (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
  if (req.query.effort_lte) filter.effort.$lte = parseInt(req.query.effort_lte, 10);
  if (req.query.effort_gte) filter.effort.$gte = parseInt(req.query.effort_gte, 10);
  db.collection('issues').find(filter).toArray()
    .then((issues) => {
      const metadata = { total_count: issues.length };
      res.json({ _metadata: metadata, records: issues });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: `Internal Server Error: ${err}` });
    });
});

app.post('/api/issues', (req, res) => {
  const newIssue = req.body;

  newIssue.created = new Date();
  if (!newIssue.status) newIssue.status = 'New';

  const errors = Issue.validateIssue(newIssue);
  if (errors) {
    res.status(422).json({ message: `Invalid request: ${errors}` });
    return;
  }

  db.collection('issues').insertOne(Issue.cleanupIssue(newIssue))
    .then(result => db.collection('issues').find({ _id: result.insertedId }).limit(1).next())
    .then(foundIssue => res.json(foundIssue))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: `Internal Server Error: ${err}` });
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('static/index.html'));
});
