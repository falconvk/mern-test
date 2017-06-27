import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class IssueEdit extends React.Component { // eslint-disable-line
  render() {
    return (
      <div>
        <div>This is a placeholder for editing issue {this.props.match.params.id}</div>
        <Link to="/issues">Back to issue list</Link>
      </div>
    );
  }
}

IssueEdit.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

};
