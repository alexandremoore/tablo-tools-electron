// @flow
import { ipcRenderer, shell } from 'electron';
import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { InputGroup, Form, Row, Col } from 'react-bootstrap';

type Props = {};
type State = {
  show: boolean,
  searchTerm: string
};

export default class IssueSearch extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      show: false,
      searchTerm: ''
    };

    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).setSearchTerm = this.setSearchTerm.bind(this);
    (this: any).searchAll = this.searchAll.bind(this);
    (this: any).searchOpen = this.searchOpen.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('search-issues', () => {
      this.setState({ show: true });
    });
  }

  searchOpen() {
    const { searchTerm } = this.state;
    const url = `https://github.com/jessedp/tablo-tools-electron/issues?q=is%3Aissue+is%3Aopen+${encodeURI(
      searchTerm
    )}`;
    shell.openExternal(url);
  }

  searchAll() {
    const { searchTerm } = this.state;
    const url = `https://github.com/jessedp/tablo-tools-electron/issues?q=${encodeURI(
      searchTerm
    )}`;
    shell.openExternal(url);
  }

  handleClose() {
    this.setState({ show: false });
  }

  setSearchTerm = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.currentTarget.value });
  };

  render() {
    const { show, searchTerm } = this.state;

    return (
      <Modal
        size=""
        show={show}
        onHide={this.handleClose}
        animation={false}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Search Issues in the Code Base</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <InputGroup size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text title="issue search">
                    <span className="fa fa-search pr-2" />
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  value={searchTerm}
                  type="text"
                  placeholder="search for..."
                  onChange={this.setSearchTerm}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="mt-2 mb-0">
            <Col md="4" className="offset-1">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={this.searchOpen}
              >
                In Open Issues
              </Button>
            </Col>
            <Col md="auto">
              <Button
                size="sm"
                variant="outline-warning"
                onClick={this.searchAll}
              >
                In Everything!*
              </Button>
            </Col>
          </Row>
          <span className="smaller muted">* not the code</span>
        </Modal.Body>
      </Modal>
    );
  }
}
