import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import IssueList from './IssueList';
import IssueEdit from './IssueEdit';

const contentNode = document.getElementById('contents');
const NoMatch = () => <p>Page Not Found</p>;

const App = props => (
  <div>
    <div className="header">
      <h1>Issue Tracker</h1>
    </div>
    <div className="contents">
      <Switch>
        {props.children}
      </Switch>
    </div>
    <div className="footer">
      Lorem Ipsum Footer
    </div>
  </div>
);

App.propTypes = {
  children: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const RoutedApp = () => (
  <BrowserRouter>
    <App>
      <Route exact path="/" render={() => (<Redirect to="/issues" />)} />
      <Route exact path="/issues" component={IssueList} />
      <Route exact path="/issues/:id" component={IssueEdit} />
      <Route path="*" component={NoMatch} />
    </App>
  </BrowserRouter>
);

ReactDOM.render(<RoutedApp />, contentNode); // Render the component inside the content Node

if (module.hot) {
  module.hot.accept();
}
