// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import fs from 'fs';

import PubSub from 'pubsub-js';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

import { format } from 'date-fns';

import VideoExport from './VideoExport';

import ExportRecordType from '../reducers/types';
import * as ExportListActions from '../actions/exportList';
import * as ActionListActions from '../actions/actionList';
import { EXP_WORKING } from '../constants/app';

import RecordingExport from './RecordingExport';
import Airing from '../utils/Airing';
import { ExportRecord } from '../utils/factories';
import Checkbox, { CHECKBOX_ON } from './Checkbox';
// import getConfig from '../utils/config';

type Props = {
  airing: Airing,
  exportList: Array<ExportRecordType>,
  label?: string,
  exportState: number,

  toggleDOF: () => void,
  deleteOnFinish: number,

  atOnce: number,
  atOnceChange: (event: SyntheticEvent<HTMLInputElement>) => void,

  cancelProcess: () => void,
  processVideo: () => void,

  addExportRecord: (record: ExportRecordType) => void,
  bulkRemExportRecord: (Array<ExportRecordType>) => void,
  remAiring: Airing => void
};

type State = { opened: boolean };

class VideoExportModal extends Component<Props, State> {
  props: Props;

  static defaultProps: Object;

  constructor() {
    super();
    this.state = { opened: false };

    (this: any).show = this.show.bind(this);
    (this: any).close = this.close.bind(this);
  }

  close = async () => {
    const {
      exportList,
      deleteOnFinish,
      remAiring,
      bulkRemExportRecord
    } = this.props;
    bulkRemExportRecord([]);
    if (deleteOnFinish === CHECKBOX_ON) {
      remAiring(exportList[0].airing);
      PubSub.publish('DB_CHANGE', '');
    }
    this.setState({ opened: false });
  };

  show() {
    const { airing, bulkRemExportRecord, addExportRecord } = this.props;
    bulkRemExportRecord([]);

    addExportRecord(ExportRecord(airing));

    this.setState({ opened: true });
  }

  render() {
    const {
      airing,
      exportList,
      exportState,
      atOnce,
      atOnceChange,
      deleteOnFinish,
      toggleDOF,
      cancelProcess,
      processVideo
    } = this.props;
    let { label } = this.props;

    const { opened } = this.state;

    let size = 'xs';
    if (label) {
      label = <span className="pl-1">{label}</span>;
      size = 'sm';
    }
    if (!exportList) {
      console.log('missing exportList!');
      return <></>; //
    }
    const airingList = exportList.map(rec => rec.airing);

    let variant = 'outline-secondary';
    let title = 'Export Video';

    if (fs.existsSync(airing.exportFile)) {
      const stats = fs.statSync(airing.exportFile);
      const ctime = format(new Date(stats.ctime), 'ccc M/d/yy @ h:mm:ss a');
      variant = 'outline-warning';
      title = `Previously Exported ${ctime}`;
    }

    return (
      <>
        <Button variant={variant} size={size} onClick={this.show} title={title}>
          <span className="fa fa-download" />
          {label}
        </Button>
        <Modal
          size="1000"
          show={opened}
          onHide={this.close}
          animation={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Export</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {airingList.map(expAiring => {
              return (
                <RecordingExport
                  airing={expAiring}
                  key={`RecordingExport-${expAiring.object_id}`}
                />
              );
            })}
          </Modal.Body>
          <Modal.Footer>
            <ExportButton
              state={exportState}
              deleteOnFinish={deleteOnFinish}
              toggleDOF={toggleDOF}
              atOnce={atOnce}
              atOnceChange={atOnceChange}
              cancel={cancelProcess}
              process={processVideo}
              close={this.close}
            />
          </Modal.Footer>
        </Modal>
      </> //
    );
  }
}
VideoExportModal.defaultProps = { label: '' };

/**
 * @return {string}
 */
function ExportButton(prop) {
  const {
    state,
    cancel,
    close,
    process,
    atOnce,
    atOnceChange,
    deleteOnFinish,
    toggleDOF
  } = prop;

  if (state === EXP_WORKING) {
    return (
      <Button variant="secondary" onClick={cancel}>
        Cancel
      </Button>
    );
  }

  // if (state === EXP_DONE) {
  //   return (
  //     <Button variant="secondary" onClick={close}>
  //       Close
  //     </Button>
  //   );
  // }

  // if state === EXP_WAITING || EXP_CANCEL
  return (
    <Row>
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
        <Button variant="primary" onClick={process} className="mr-2">
          Export
        </Button>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => {
  const { exportList } = state;
  return {
    exportList: exportList.exportList
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { ...ExportListActions, ...ActionListActions },
    dispatch
  );
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(VideoExport(VideoExportModal));
