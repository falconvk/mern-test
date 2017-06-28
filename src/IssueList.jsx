import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import 'whatwg-fetch';

import IssueAdd from './IssueAdd';
import IssueFilter from './IssueFilter';

const IssueRow = props => (
  <tr>
    <td>
      <Link to={`/issues/${props.issue._id}`}>
        {props.issue._id.substr(-4)}
      </Link>
    </td>
    <td>{props.issue.status}</td>
    <td>{props.issue.owner}</td>
    <td>{props.issue.created.toDateString()}</td>
    <td>{props.issue.effort}</td>
    <td>{props.issue.completionDate ? props.issue.completionDate.toDateString() : ''}</td>
    <td>{props.issue.title}</td>
  </tr>
);

IssueRow.propTypes = {
  issue: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
    owner: PropTypes.string,
    created: PropTypes.date,
    effort: PropTypes.num,
    completionDate: PropTypes.date,
    title: PropTypes.string,
  }).isRequired,
};

const IssueTable = (props) => {
  const issueRows = props.issues.map(issue => <IssueRow key={issue._id} issue={issue} />);
  return (
    <table className="bordered-table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Completion Date</th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        {issueRows}
      </tbody>
    </table>
  );
};

IssueTable.propTypes = {
  issues: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const oldQuery = queryString.parse(prevProps.location.search);
    const newQuery = queryString.parse(this.props.location.search);
    if (oldQuery.status === newQuery.status
      && oldQuery.effort_gte === newQuery.effort_gte
      && oldQuery.effort_lte === newQuery.effort_lte) {
      return;
    }
    this.loadData();
  }

  loadData() {
    fetch(`/api/issues${this.props.location.search}`).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          // console.log('Total count of records: ', data._metadata.total_count);
          data.records.forEach((issue) => {
            issue.created = new Date(issue.created);
            if (issue.completionDate) issue.completionDate = new Date(issue.completionDate);
          });
          this.setState({ issues: data.records });
        });
      } else {
        response.json().then((error) => {
          alert(`Failed to fetch issues:  ${error.message}`); // eslint-disable-line no-alert
        });
      }
    }).catch((err) => {
      alert(`Error in fetching data from server: ${err}`); // eslint-disable-line no-alert
    });
  }

  createIssue(newIssue) {
    fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIssue),
    }).then((response) => {
      if (response.ok) {
        response.json().then((updatedIssue) => {
          updatedIssue.created = new Date(updatedIssue.created);
          if (updatedIssue.completionDate) {
            updatedIssue.completionDate = new Date(updatedIssue.completionDate);
          }
          const newIssues = this.state.issues.concat(updatedIssue);
          this.setState({ issues: newIssues });
        });
      } else {
        response.json().then((error) => {
          alert(`Failed to add issue: ${error.message}`); // eslint-disable-line no-alert
        });
      }
    }).catch((err) => {
      alert(`Error in sending data to server: ${err.message}`); // eslint-disable-line no-alert
    });
  }

  setFilter(search) {
    console.log(queryString.stringify(search));
    this.props.history.push({
      pathname: this.props.location.pathname,
      search: queryString.stringify(search),
    });
  }

  render() {
    return (
      <div>
        <IssueFilter
          setFilter={this.setFilter}
          initFilter={queryString.parse(this.props.location.search)}
        />
        <hr />
        <IssueTable issues={this.state.issues} />
        <hr />
        <IssueAdd createIssue={this.createIssue} />
      </div>
    );
  }
}

IssueList.propTypes = {
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

IssueList.contextTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default withRouter(IssueList);
