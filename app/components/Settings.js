// @flow
import os from 'os';
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Table from 'react-bootstrap/Table';
import { isValidIp } from '../utils/utils';
import { updateApi } from '../utils/Tablo';
import { recFile, showFile } from '../utils/db';

type Props = {};
type State = {
  episodePath: string,
  moviePath: string,
  eventPath: string,
  enableIpOverride: boolean,
  overrideIp: string,
  enableExportData: boolean,
  exportDataPath: string,
  saveStatus: ?Array<string>
};

export default class Settings extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = {
      episodePath: `${os.homedir()}/TabloRecordings/TV`,
      moviePath: `${os.homedir()}/TabloRecordings/Movies`,
      eventPath: `${os.homedir()}/TabloRecordings/Events`,
      enableIpOverride: false,
      overrideIp: '',
      enableExportData: false,
      exportDataPath: `${os.tmpdir()}/tablo-data/`,
      saveStatus: []
    };

    const storedState = JSON.parse(localStorage.getItem('AppConfig') || '{}');

    this.state = Object.assign(this.initialState, storedState);

    this.setEpisodePath = this.setEpisodePath.bind(this);
    this.setMoviePath = this.setMoviePath.bind(this);
    this.setEventPath = this.setEventPath.bind(this);

    this.toggleIpOverride = this.toggleIpOverride.bind(this);
    this.setOverrideIp = this.setOverrideIp.bind(this);

    this.toggleDataExport = this.toggleDataExport.bind(this);
    this.setExportDataPath = this.setExportDataPath.bind(this);

    this.saveConfig = this.saveConfig.bind(this);
  }

  /**
   async componentDidMount() {
  }
   */

  saveConfig = () => {
    const cleanState = this.state;
    delete cleanState.saveStatus;
    const invalid = [];
    if (cleanState.enableIpOverride) {
      if (!isValidIp(cleanState.overrideIp)) {
        invalid.push(`Invalid IP Address: ${cleanState.overrideIp}`);
      }
    }
    // try to validate Export path??

    this.setState({ saveStatus: invalid });
    if (invalid.length === 0) {
      localStorage.setItem('AppConfig', JSON.stringify(cleanState));
      updateApi();
    }
  };

  toggleIpOverride = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ enableIpOverride: event.currentTarget.checked });
  };

  setOverrideIp = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ overrideIp: event.currentTarget.value });
  };

  toggleDataExport = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ enableExportData: event.currentTarget.checked });
  };

  setExportDataPath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ exportDataPath: event.currentTarget.value });
  };

  setEpisodePath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ episodePath: event.currentTarget.value });
  };

  setMoviePath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ moviePath: event.currentTarget.value });
  };

  setEventPath = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ eventPath: event.currentTarget.value });
  };

  render() {
    const {
      saveStatus,
      enableIpOverride,
      overrideIp,
      enableExportData,
      exportDataPath,
      episodePath,
      moviePath,
      eventPath
    } = this.state;

    return (
      <Container>
        <Row style={{ width: '100%' }}>
          <Col>
            <Alert variant="primary"> Settings</Alert>
          </Col>
        </Row>
        <Row>
          <Col>
            <SaveStatus invalid={saveStatus} />
          </Col>
        </Row>
        <Row>
          <Form style={{ width: '100%' }} onSubmit={e => e.preventDefault()}>
            <Form.Row>
              <Form.Group controlId="episodePath" style={{ width: '35%' }}>
                <Form.Label>Series/Episode Path</Form.Label>
                <Form.Control
                  value={episodePath}
                  type="text"
                  placeholder="Enter Episode Path"
                  onChange={this.setEpisodePath}
                />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group controlId="moviePath" style={{ width: '35%' }}>
                <Form.Label>Movie Path</Form.Label>
                <Form.Control
                  value={moviePath}
                  type="text"
                  placeholder="Enter Movie Path"
                  onChange={this.setMoviePath}
                />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group controlId="eventPath" style={{ width: '35%' }}>
                <Form.Label>Sport/Event Path</Form.Label>
                <Form.Control
                  value={eventPath}
                  type="text"
                  placeholder="Enter Event Path"
                  onChange={this.setEventPath}
                />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group controlId="overrideIp">
                <Form.Check
                  checked={enableIpOverride}
                  className="pr-2"
                  onChange={this.toggleIpOverride}
                  type="checkbox"
                  label="Override Tablo IP?"
                />
                <Form.Control
                  value={overrideIp}
                  type="text"
                  placeholder="Enter IP"
                  onChange={this.setOverrideIp}
                  disabled={!enableIpOverride}
                />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group controlId="exportData">
                <Form.Check
                  checked={enableExportData}
                  onChange={this.toggleDataExport}
                  type="checkbox"
                  label="Export Tablo Data?"
                />
                <Form.Control
                  value={exportDataPath}
                  type="text"
                  placeholder="Enter Path"
                  onChange={this.setExportDataPath}
                  disabled={!enableExportData}
                />
              </Form.Group>
            </Form.Row>
          </Form>
        </Row>
        <Row>
          <Button variant="primary" type="button" onClick={this.saveConfig}>
            Save
          </Button>
        </Row>
        <Row className="pt-5">
          <h3>Internal Settings</h3>
          <Table>
            <tr>
              <th>Recording DB</th>
              <td>{recFile}</td>
            </tr>
            <tr>
              <th>Show DB</th>
              <td>{showFile}</td>
            </tr>
          </Table>
        </Row>
      </Container>
    );
  }
}

/**
 * @return {string}
 */
function SaveStatus(prop) {
  const { invalid } = prop;

  if (invalid == null || invalid === 'undefined') return '';

  if (invalid.length === 0) {
    return <Alert variant="success">Settings Saved!</Alert>;
  }
  return (
    <Alert variant="danger">
      Errors occurred saving Settings!
      {invalid.map(item => (
        <li>{item}</li>
      ))}
    </Alert>
  );
}
