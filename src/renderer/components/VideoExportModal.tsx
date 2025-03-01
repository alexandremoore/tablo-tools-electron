import { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';

import PubSub from 'pubsub-js';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

import { format } from 'date-fns';
import VideoExport from './VideoExport';
import { ExportRecordType } from '../constants/types';
import * as ExportListActions from '../store/exportList';
import * as ActionListActions from '../store/actionList';
import { EXP_WORKING } from '../constants/app';
import RecordingExport from './RecordingExport';
import Airing from '../utils/Airing';
import { ExportRecord } from '../utils/factories';
import Checkbox, { CHECKBOX_ON } from './Checkbox';

import getConfig from '../utils/config';

interface Props extends PropsFromRedux {
  airing: Airing;
  label?: string; // FIXME: input or type
  exportState: number;
  toggleDOF: () => void;
  deleteOnFinish: number;
  atOnce: number;
  atOnceChange: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  cancelProcess: () => void;
  processVideo: () => void;
}

/**
 * @return {string}
 */
function ExportButton(prop: any) {
  const {
    state,
    cancel,
    close,
    process,
    atOnce,
    atOnceChange,
    deleteOnFinish,
    toggleDOF,
  } = prop;

  if (state === EXP_WORKING) {
    return (
      <Button variant="secondary" onClick={cancel}>
        Cancel
      </Button>
    );
  }

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

type State = {
  opened: boolean;
};

class VideoExportModal extends Component<Props, State> {
  static defaultProps = {
    label: '',
  };

  constructor(props: Props) {
    super(props);
    // this.props = props;
    this.state = {
      opened: false,
    };
    (this as any).show = this.show.bind(this);
    (this as any).close = this.close.bind(this);
  }

  close = async () => {
    const { exportList, deleteOnFinish, remAiring, bulkRemExportRecord } =
      this.props;
    bulkRemExportRecord();
    window.Airing.cancelExportVideo(exportList[0].airing);
    if (deleteOnFinish === CHECKBOX_ON) {
      remAiring(exportList[0].airing);
      PubSub.publish('DB_CHANGE', '');
    }

    this.setState({
      opened: false,
    });
  };

  show() {
    const { airing, bulkRemExportRecord, addExportRecord } = this.props;
    bulkRemExportRecord();
    addExportRecord(ExportRecord(airing.data));
    this.setState({
      opened: true,
    });
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
      processVideo,
    } = this.props;
    const { label } = this.props;
    const { opened } = this.state;
    let size = 'xs';
    let prettyLabel = <></>;

    if (label) {
      prettyLabel = <span className="pl-1">{label}</span>;
      size = 'sm';
    }

    if (!exportList) {
      console.log('missing exportList!');
      return <></>; //
    }

    // const airingList = exportList.map((rec: ExportRecordType) => rec.airing);
    let airingList = [];

    if (exportList.length > 0 && exportList[0] !== undefined) {
      // console.log('exportList', exportList);
      airingList = exportList.map((rec: ExportRecordType) => rec.airing);
    }

    let variant = 'outline-secondary';
    let title = 'Export Video';

    if (window.fs.existsSync(airing.exportFile)) {
      const stats = window.fs.statSync(airing.exportFile);
      const ctime = format(new Date(stats.ctime), 'ccc M/d/yy @ h:mm:ss a');
      variant = 'outline-warning';
      title = `Previously Exported ${ctime}`;
    }

    let buttonDisabled = false;
    if (airing.videoDetails.state === 'recording') {
      buttonDisabled = true;
      title = 'Recording in progress, Export disabled';
    }

    return (
      <>
        <Button
          variant={variant}
          size={size as any}
          onClick={this.show}
          title={title}
          disabled={buttonDisabled}
        >
          <span className="fa fa-download" />
          {prettyLabel}
        </Button>
        <Modal
          size={'1000' as any}
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
            {airingList.map((expAiring: Airing) => {
              return (
                <RecordingExport
                  airing={expAiring}
                  actionOnDuplicate={getConfig().actionOnDuplicate}
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

const mapStateToProps = (state: any) => {
  const { exportList } = state;
  return {
    exportList: exportList.records,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    { ...ExportListActions, ...ActionListActions },
    dispatch
  );
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(VideoExport(VideoExportModal));

// export default connect<StateProps, DispatchProps, OwnProps>(
//   mapStateToProps,
//   mapDispatchToProps
// )(VideoExport(VideoExportModal));
