import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient, ObjectId } from 'mongodb';
import 'babel-polyfill'; // import once in application to enable ES2015 objects & methods
import SourceMapSupport from 'source-map-support';

// Import Helpers
import Issue from './issue';

// Server Rendering
import renderedPageRouter from './renderedPageRouter';

// Set up Source Map Support
SourceMapSupport.install();

// Set up express server
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

app.get('/api/issues/:id', (req, res) => {
  let issueId;
  try {
    issueId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid issue ID format: ${error}` });
    return;
  }

  db.collection('issues').find({ _id: issueId }).limit(1)
    .next()
    .then((issue) => {
      if (!issue) res.status(404).json({ message: `No such issue: ${issueId}` });
      else res.json(issue);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
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

app.put('/api/issues/:id', (req, res) => {
  let issueId;
  try {
    issueId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid issue ID format: ${error}` });
    return;
  }

  const issue = req.body;
  delete issue._id;

  const err = Issue.validateIssue(issue);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('issues').replaceOne({ _id: issueId }, Issue.convertIssue(issue))
    .then(() => db.collection('issues').find({ _id: issueId }).limit(1)
      .next(),
    )
    .then((savedIssue) => {
      res.json(savedIssue);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
});

app.delete('/api/issues/:id', (req, res) => {
  let issueId;
  try {
    issueId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid issue ID format: ${error}` });
    return;
  }

  db.collection('issues').deleteOne({ _id: issueId })
    .then((deleteResult) => {
      if (deleteResult.result.n === 1) res.json({ status: 'OK' });
      else res.json({ status: 'Warning: object not found' });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
});

app.use('/', renderedPageRouter);
