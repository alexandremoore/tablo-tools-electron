// @flow
import React, { Component } from 'react';
import * as Sentry from '@sentry/electron';

import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import InputGroup from 'react-bootstrap/InputGroup';
import { isValidIp } from '../utils/utils';
import { discover } from '../utils/Tablo';
import getConfig, { ConfigType } from '../utils/config';
import ExportData from './ExportData';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';

const SAVE_NONE = 0;
const SAVE_FAIL = 1;
const SAVE_SUCCESS = 2;

type Props = {};

const { dialog } = require('electron').remote;

export default class Settings extends Component<Props, ConfigType> {
  props: Props;

  constructor() {
    super();

    const storedState = getConfig();

    storedState.saveState = SAVE_NONE;

    this.state = storedState;

    this.setEpisodePath = this.setEpisodePath.bind(this);
    this.setMoviePath = this.setMoviePath.bind(this);
    this.setEventPath = this.setEventPath.bind(this);
    this.setPathDialog = this.setPathDialog.bind(this);

    this.toggleIpOverride = this.toggleIpOverride.bind(this);
    this.toggleAutoRebuild = this.toggleAutoRebuild.bind(this);
    this.toggleNotifyBeta = this.toggleNotifyBeta.bind(this);
    this.toggleErrorReport = this.toggleErrorReport.bind(this);
    this.setTestDeviceIp = this.setTestDeviceIp.bind(this);

    this.toggleDataExport = this.toggleDataExport.bind(this);
    this.setExportDataPath = this.setExportDataPath.bind(this);

    this.saveConfig = this.saveConfig.bind(this);
  }

  setPathDialog = (field: string) => {
    const file = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    });
    if (file) {
      const fields = {};
      // eslint-disable-next-line prefer-destructuring
      fields[field] = file[0];
      this.setState(fields);
    }
  };

  saveConfig = () => {
    const cleanState = { ...this.state };
    cleanState.saveData = [];
    const invalid = [];
    let result = SAVE_FAIL;
    if (cleanState.enableTestDevice) {
      if (!isValidIp(cleanState.testDeviceIp)) {
        invalid.push(`Invalid IP Address: ${cleanState.testDeviceIp}`);
      }
    }

    // TODO:  try to validate Export paths?
    if (invalid.length === 0) {
      if (Sentry.getCurrentHub().getClient()) {
        Sentry.getCurrentHub()
          .getClient()
          .getOptions().enabled = cleanState.allowErrorReport;
      } else {
        console.error('Unable to set Sentry reporting value');
      }

      localStorage.setItem('AppConfig', JSON.stringify(cleanState));
      discover();
      result = SAVE_SUCCESS;
      setTimeout(() => {
        this.setState({ saveState: SAVE_NONE });
      }, 3000);
    }

    this.setState({ saveState: result, saveData: [] });
  };

  toggleIpOverride = () => {
    const { enableTestDevice } = this.state;
    this.setState({ enableTestDevice: !enableTestDevice });
  };

  toggleAutoRebuild = () => {
    const { autoRebuild } = this.state;
    this.setState({ autoRebuild: !autoRebuild });
  };

  toggleNotifyBeta = () => {
    const { notifyBeta } = this.state;
    this.setState({ notifyBeta: !notifyBeta });
  };

  toggleErrorReport = () => {
    const { allowErrorReport } = this.state;
    this.setState({ allowErrorReport: !allowErrorReport });
  };

  setTestDeviceIp = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ testDeviceIp: event.currentTarget.value });
  };

  toggleDataExport = () => {
    const { enableExportData } = this.state;
    this.setState({ enableExportData: !enableExportData });
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
      saveData,
      saveState,
      autoRebuild,
      notifyBeta,
      allowErrorReport,
      enableTestDevice,
      testDeviceIp,
      enableExportData,
      exportDataPath,
      episodePath,
      moviePath,
      eventPath
    } = this.state;

    return (
      <Container>
        <Alert variant="primary" className="p-2 m-2">
          <Row>
            <Col md="2" className="pt-2">
              <h4 className="pl-2">Settings</h4>
            </Col>
            <Col>
              <Button
                size="sm"
                className="mt-1 ml-5"
                variant="outline-light"
                type="button"
                onClick={this.saveConfig}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Alert>
        <Row>
          <Col>
            <SaveStatus invalid={saveData} state={saveState} />
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Checkbox
              handleChange={this.toggleAutoRebuild}
              checked={autoRebuild ? CHECKBOX_ON : CHECKBOX_OFF}
              label="Enable automatically rebuilding local database?"
            />
            <div className="pl-4 smaller">
              Occurs every 30 minutes behind the scenes
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Checkbox
              handleChange={this.toggleNotifyBeta}
              checked={notifyBeta ? CHECKBOX_ON : CHECKBOX_OFF}
              label="Show notification of pre-releases (beta, alpha, etc)?"
            />
            <div className="pl-4 smaller">
              Notifications will always be shown for full/normal releases that
              everyone will want. Windows and Linux will auto-update...
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Checkbox
              handleChange={this.toggleErrorReport}
              label="Allow sending Error Reports?"
              checked={allowErrorReport ? CHECKBOX_ON : CHECKBOX_OFF}
            />
            <div className="pl-4 smaller">
              No personal data is collected - this simply notifies of us errors
              before you may post about it or even notice a problem. It does the{' '}
              <i>white screen of death</i> information gathering for you (and
              more).
            </div>
          </Col>
        </Row>

        <Row className="p-1 mt-3 mb-2">
          <Col md="7" className="pt-1 border bg-light">
            <h6 className="pt-1">Export Paths:</h6>
          </Col>
        </Row>

        <Directory
          label="Series/Episode"
          onClick={() => this.setPathDialog('episodePath')}
          onChange={this.setEpisodePath}
          value={episodePath}
          disabled={false}
        />
        <Directory
          label="Movie"
          onClick={() => this.setPathDialog('moviePath')}
          onChange={this.setMoviePath}
          value={moviePath}
          disabled={false}
        />
        <Directory
          label="Sport/Event"
          onClick={() => this.setPathDialog('eventPath')}
          onChange={this.setEventPath}
          value={eventPath}
          disabled={false}
        />
        <br />

        <Row className="p-1 mb-2">
          <Col md="7" className="pt-1 border bg-light">
            <h6 className="pt-1">Advanced:</h6>
          </Col>
        </Row>

        <div style={{ width: '375px' }}>
          <Row>
            <Col>
              <Checkbox
                handleChange={this.toggleIpOverride}
                checked={enableTestDevice ? CHECKBOX_ON : CHECKBOX_OFF}
                label="Enable Test Device?"
              />
            </Col>
          </Row>
          <Row className="m-0 p-0">
            <Col>
              <InputGroup size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text title="Test Device IP address">
                    <span className="fa fa-network-wired pr-2" />
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  value={testDeviceIp}
                  type="text"
                  placeholder="Enter IP"
                  onChange={this.setTestDeviceIp}
                  disabled={!enableTestDevice}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              <Checkbox
                handleChange={this.toggleDataExport}
                checked={enableExportData ? CHECKBOX_ON : CHECKBOX_OFF}
                label="Export Tablo Data?"
              />
              <div className="smaller">
                Writes out the raw JSON received from the Tablo to files.
              </div>
            </Col>
          </Row>
        </div>
        <div>
          <Row>
            <Col>
              <Directory
                label="Export Path"
                onClick={() => this.setPathDialog('exportDataPath')}
                onChange={this.setExportDataPath}
                value={exportDataPath}
                disabled={!enableExportData}
              />
            </Col>
          </Row>
        </div>

        <Row className="p-1 mb-2 mt-5">
          <Col md="7" className="pt-1 border bg-warning">
            <h6 className="pt-1 text-white">DEBUG:</h6>
          </Col>
        </Row>

        <Row>
          <Col>
            <ExportData />
          </Col>
        </Row>
      </Container>
    );
  }
}

/**
 * @return {string}
 */
function SaveStatus(prop) {
  const { state, invalid } = prop;

  if (state === SAVE_NONE) return '';

  if (state === SAVE_SUCCESS) {
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

function Directory(prop) {
  const { label, value, onClick, onChange, disabled } = prop;

  return (
    <div className="d-flex flex-row">
      <div>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text title={label} style={{ width: '110px' }}>
              {label}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            value={value}
            placeholder={`Enter ${label}`}
            style={{ width: '350px' }}
            onChange={onChange}
            disabled={disabled}
          />
          <InputGroup.Append>
            <Button
              size="xs"
              variant="outline-secondary"
              onClick={onClick}
              disabled={disabled}
            >
              <span className="fa fa-folder-open" />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </div>
  );
}
