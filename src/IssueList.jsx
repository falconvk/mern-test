import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import 'whatwg-fetch';
import { Button, Glyphicon, Table, Panel } from 'react-bootstrap';

import IssueFilter from './IssueFilter';
import Toast from './Toast';

const IssueRow = (props) => {
  function onDeleteClick() {
    props.deleteIssue(props.issue._id);
  }

  return (
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
      <td>
        <Button bsSize="xsmall" onClick={onDeleteClick}>
          <Glyphicon glyph="trash" />
        </Button>
      </td>
    </tr>
  );
};

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
  deleteIssue: PropTypes.func.isRequired,
};

const IssueTable = (props) => {
  const issueRows = props.issues.map(issue =>
    (<IssueRow
      key={issue._id}
      issue={issue}
      deleteIssue={props.deleteIssue}
    />),
  );
  return (
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th>Id</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Completion Date</th>
          <th>Title</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {issueRows}
      </tbody>
    </Table>
  );
};

IssueTable.propTypes = {
  issues: PropTypes.array.isRequired,
  deleteIssue: PropTypes.func.isRequired,
};

class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {
      issues: [],
      toastVisible: false,
      toastMessage: '',
      toastType: 'danger',
    };
    this.setFilter = this.setFilter.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
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

  setFilter(search) {
    this.props.history.push({
      pathname: this.props.location.pathname,
      search: queryString.stringify(search),
    });
  }

  loadData() {
    fetch(`/api/issues${this.props.location.search}`)
      .then((response) => {
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
            this.showError(`Failed to fetch issues:  ${error.message}`);
          });
        }
      })
      .catch((err) => {
        this.showError(`Error in fetching data from server: ${err}`);
      });
  }

  deleteIssue(id) {
    fetch(`/api/issues/${id}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) this.showError('Failed to delete issue');
        else this.loadData();
      })
      .catch(err => this.showError(`Error in deleting issue: ${err.message}`));
  }

  showError(message) {
    this.setState({ toastVisible: true, toastMessage: message, toastType: 'danger' });
  }

  dismissToast() {
    this.setState({ toastVisible: false });
  }

  render() {
    return (
      <div>
        <Panel collapsible header="Filter">
          <IssueFilter
            setFilter={this.setFilter}
            initFilter={queryString.parse(this.props.location.search)}
          />
        </Panel>
        <IssueTable issues={this.state.issues} deleteIssue={this.deleteIssue} />
        <Toast
          showing={this.state.toastVisible}
          message={this.state.toastMessage}
          onDismiss={this.dismissToast}
          bsStyle={this.state.toastType}
        />
      </div>
    );
  }
}

IssueList.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

IssueList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(IssueList);
