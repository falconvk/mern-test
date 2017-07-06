import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormControl, Button } from 'react-bootstrap';

export default class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.issueAdd;
    this.props.createIssue({
      owner: form.owner.value,
      title: form.title.value,
      status: 'New',
      created: new Date(),
    });
    // Clear the form for the next input
    form.owner.value = '';
    form.title.value = '';
  }

  render() {
    return (
      <div>
        <Form inline name="issueAdd" onSubmit={this.handleSubmit}>
          <FormControl name="owner" placeholder="Owner" bsSize="small" />
          {' '}
          <FormControl name="title" placeholder="Title" bsSize="small" />
          {' '}
          <Button type="submit" bsStyle="primary" bsSize="small">Add</Button>
        </Form>
      </div>
    );
  }
}

IssueAdd.propTypes = {
  createIssue: PropTypes.func.isRequired,
};
