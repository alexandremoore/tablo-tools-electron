// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Prompt, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { Alert } from 'react-bootstrap';

import Airing from '../utils/Airing';
import RecordingExport from './RecordingExport';
import * as ExportListActions from '../actions/exportList';

import VideoExport from './VideoExport';
import ExportRecordType from '../reducers/types';
import {
  EXP_WORKING,
  DUPE_SKIP,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_ADDID
} from '../constants/app';
import { ExportRecord } from '../utils/factories';
import Checkbox from './Checkbox';
import routes from '../constants/routes.json';

type Props = {
  actionList: Array<Airing>,
  exportList: Array<ExportRecordType>,
  exportState: number,

  atOnce: number,
  atOnceChange: (event: SyntheticEvent<HTMLInputElement>) => void,

  actionOnDuplicate: string,
  setActionOnDuplicate: (action: string) => void,

  deleteOnFinished: number,
  toggleDOF: () => void,

  cancelProcess: () => void,
  processVideo: () => void,

  addExportRecord: (record: ExportRecordType) => void,
  bulkRemExportRecord: (Array<ExportRecordType>) => void
};

type State = { loaded: boolean };

class VideoExportPage extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { loaded: false };
  }

  componentDidMount() {
    const { actionList, addExportRecord } = this.props;
    actionList.forEach(rec => {
      addExportRecord(ExportRecord(rec));
    });
    this.setState({ loaded: true });
  }

  componentWillUnmount() {
    const { bulkRemExportRecord } = this.props;
    bulkRemExportRecord([]);
  }

  render() {
    const { loaded } = this.state;
    const {
      exportList,
      exportState,
      atOnce,
      atOnceChange,
      deleteOnFinished,
      toggleDOF,
      actionOnDuplicate,
      setActionOnDuplicate,
      cancelProcess,
      processVideo
    } = this.props;

    if (!loaded) return <></>; //

    if (exportList.length === 0) {
      return <Redirect to={routes.SEARCH} />;
    }

    const timeSort = (a, b) => {
      if (a.airing.airingDetails.datetime < b.airing.airingDetails.datetime)
        return 1;
      return -1;
    };

    exportList.sort((a, b) => timeSort(a, b));

    return (
      <>
        <Prompt
          when={exportState === EXP_WORKING}
          message="Leaving will CANCEL all Exports in progress. Are you sure?"
        />
        <ExportActions
          state={exportState}
          atOnce={atOnce}
          atOnceChange={atOnceChange}
          cancel={cancelProcess}
          process={processVideo}
          toggleDOF={toggleDOF}
          deleteOnFinish={deleteOnFinished}
          actionOnDuplicate={actionOnDuplicate}
          setActionOnDuplicate={setActionOnDuplicate}
        />
        {exportList.map(rec => {
          return (
            <RecordingExport
              airing={rec.airing}
              key={`RecordingExport-${rec.airing.object_id}`}
              actionOnDuplicate={actionOnDuplicate}
            />
          );
        })}
      </> //
    );
  }
}

/**
 * @return {string}
 */
function ExportActions(prop) {
  const {
    state,
    cancel,
    process,
    atOnce,
    atOnceChange,
    deleteOnFinish,
    toggleDOF,
    actionOnDuplicate,
    setActionOnDuplicate
  } = prop;

  if (state === EXP_WORKING) {
    return (
      <Alert variant="primary" className="p-2 m-2">
        <Row>
          <Col md="5" />
          <Col md="2">
            <Button variant="warning" onClick={cancel}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Alert>
    );
  }

  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Alert variant="primary" className="p-2 m-2">
      <Row>
        <Col md="4" className="pt-2">
          <h4 className="pl-2">Export Recordings</h4>
        </Col>
        <Col md="auto">
          <InputGroup size="sm" className="pt-1">
            <InputGroup.Prepend>
              <InputGroup.Text title="More than 2 is probably silly, but YOLO!">
                <span className="fa fa-info pr-2" />
                Max:
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              as="select"
              value={atOnce}
              aria-describedby="btnState"
              onChange={atOnceChange}
              title="More than 2 is probably silly, but YOLO!"
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </Form.Control>
          </InputGroup>
        </Col>
        <Col md="auto">
          <Button variant="light" onClick={process} className="mr-2">
            Export
          </Button>
        </Col>
        <Col md="auto" className="pt-2">
          <Checkbox
            checked={deleteOnFinish}
            handleChange={toggleDOF}
            label="Delete when finished?"
          />
        </Col>
        <Col md="auto">
          <InputGroup size="sm" className="pt-1">
            <InputGroup.Prepend>
              <InputGroup.Text title="More than 2 is probably silly, but YOLO!">
                <span className="fa fa-info pr-2" />
                On duplicate:
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              as="select"
              value={actionOnDuplicate}
              aria-describedby="btnState"
              onChange={setActionOnDuplicate}
              title="More than 2 is probably silly, but YOLO!"
            >
              <option value={DUPE_INC}>{DUPE_INC.toLowerCase()}</option>
              <option value={DUPE_OVERWRITE}>
                {DUPE_OVERWRITE.toLowerCase()}
              </option>
              <option value={DUPE_ADDID}>add id</option>
              <option value={DUPE_SKIP}>{DUPE_SKIP.toLowerCase()}</option>
            </Form.Control>
          </InputGroup>
        </Col>{' '}
      </Row>
    </Alert>
  );
}

const mapStateToProps = state => {
  const { exportList } = state;
  return {
    actionList: state.actionList,
    exportList: exportList.exportList
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ExportListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(VideoExport(VideoExportPage));
