import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class IssueEdit extends React.Component {
  constructor() {
    super();
    this.state = {
      issue: {
        _id: '',
        title: '',
        status: '',
        owner: '',
        effort: '',
        completionDate: '',
        created: '',
      },
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.loadData();
    }
  }

  onChange(event) {
    const issue = Object.assign({}, this.state.issue);
    issue[event.target.name] = event.target.value;
    this.setState({ issue });
  }

  loadData() {
    fetch(`/api/issues/${this.props.match.params.id}`)
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((issue) => {
              issue.created = new Date(issue.created).toDateString();
              issue.completionDate = issue.completionDate
                ? new Date(issue.completionDate).toDateString()
                : '';
              issue.effort = issue.effort ? issue.effort.toString() : '';
              this.setState({ issue });
            });
        } else {
          response.json().then(error => alert(`Failed to fetch issue: ${error.message}`));
        }
      })
      .catch(error => alert(`Error in fetching data from server: ${error.message}`));
  }

  render() {
    const issue = this.state.issue;
    return (
      <div>
        <form>
          ID: {issue._id}
          <br />
          Created: {issue.created}
          <br />
          Status:
          <select
            name="status"
            value={issue.status}
            onChange={this.onChange}
          >
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="Fixed">Fixed</option>
            <option value="Verified">Verified</option>
            <option value="Closed">Closed</option>
          </select>
          <br />
          Owner:
          <input
            name="owner"
            value={issue.owner}
            onChange={this.onChange}
          />
          <br />
          Effort:
          <input
            name="effort"
            value={issue.effort}
            onChange={this.onChange}
            size={5}
          />
          <br />
          Completion Date:
          <input
            name="completionDate"
            value={issue.completionDate}
            onChange={this.onChange}
          />
          <br />
          Title:
          <input
            name="title"
            value={issue.title}
            onChange={this.onChange}
          />
          <br />
          <button type="submit">Submit</button>
          <Link to="/issues">Back to issue list</Link>
        </form>
      </div>
    );
  }
}

IssueEdit.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
