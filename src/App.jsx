import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import {
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  Glyphicon,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import IssueList from './IssueList';
import IssueEdit from './IssueEdit';

const contentNode = document.getElementById('contents');
const NoMatch = () => <p>Page Not Found</p>;

const Header = () => (
  <Navbar fluid>
    <Navbar.Header>
      <Navbar.Brand>Issue Tracker</Navbar.Brand>
    </Navbar.Header>
    <Nav>
      <LinkContainer to="/issues">
        <NavItem>Issues</NavItem>
      </LinkContainer>
      <LinkContainer to="/reports">
        <NavItem>Reports</NavItem>
      </LinkContainer>
    </Nav>
    <Nav pullRight>
      <NavItem><Glyphicon glyph="plus" /> Create Issue</NavItem>
      <NavDropdown
        id="user-dropdown"
        title={<Glyphicon glyph="option-horizontal" />}
        noCaret
      >
        <MenuItem>Logout</MenuItem>
      </NavDropdown>
    </Nav>
  </Navbar>
);

const App = props => (
  <div>
    <Header />
    <div className="container-fluid">
      <Switch>
        {props.children}
      </Switch>
      <hr />
      <h5>
        <small>
          Full source code available
          at <a href="https://github.com/falconvk/mern-test">this GitHub repository</a>.
        </small>
      </h5>
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
