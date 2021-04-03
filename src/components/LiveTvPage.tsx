// @flow
import React, { Component } from 'react';

import PubSub from 'pubsub-js';

// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import { withRouter } from 'react-router-dom';

// import { format } from 'date-fns';

import { Row, Col, Spinner, Table, Alert } from 'react-bootstrap';
import Channel from '../utils/Channel';
import TabloLivePlayer from './TabloLivePlayer';

type Props = {};
type State = {
  channelList: Array<Channel>
};

class LiveTvPage extends Component<Props, State> {
  props: Props;

  psToken: null;

  constructor() {
    super();

    this.state = { channelList: [] };

    // (this: any).watch = this.watch.bind(this);
    // (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  refresh = async () => {
    // const { Api } = global;

    // const start = new Date().toISOString(); // 2020-06-09T23:00Z
    const recs = await global.ChannelDb.asyncFind({});

    // TODO: use Channel objects (redux)
    const channelList = recs.map(rec => new Channel(rec));

    // channelList.sort((a, b) => channelSort(a, b));
    channelList.sort((a, b) => {
      return (
        a.channel.major - b.channel.major || a.channel.minor - b.channel.minor
      );
    });

    this.setState({ channelList });
  };

  render() {
    const { channelList } = this.state;

    if (channelList.length === 0) {
      return <Loading />;
    }

    return (
      <>
        <Alert variant="secondary">
          <h3>
            Live TV{' '}
            <span className="smaller">({channelList.length} channels)</span>
          </h3>
        </Alert>
        <span className="smallerish muted">
          <i>Note:</i> It&apos;s highly unlikley this will be built out further.
        </span>
        <div className="scrollable-area">
          <Row>
            <Col md="6">
              <Table striped>
                <tbody>
                  {channelList.map(rec => {
                    return (
                      <tr key={`${rec.channel.major}-${rec.channel.minor}`}>
                        <td>
                          {rec.channel.major} -{rec.channel.minor}
                          <span className="smaller pl-2">
                            ({rec.channel.callSign})
                          </span>
                        </td>
                        <td>
                          {rec.channel.network
                            ? rec.channel.network
                            : rec.channel.callSign}
                        </td>
                        <td>
                          <TabloLivePlayer channel={rec} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </div>
      </> //
    );
  }
}

function Loading() {
  return (
    <div
      className="d-flex justify-content-center"
      style={{ maxWidth: '400px', marginTop: '75px' }}
    >
      <Spinner
        animation="border"
        size="md"
        variant="primary"
        className="mr-2"
      />
      <span className="pt-2">
        Channels will show up once the db finshes reloading...
      </span>
    </div>
  );
}

export default LiveTvPage;

// const mapDispatchToProps = dispatch => {
//   return bindActionCreators(SearchActions, dispatch);
// };

// const mapStateToProps = (state: any) => {
//   return {
//     actionList: state.actionList
//   };
// };

// export default connect<*, *, *, *, *, *>(
//   mapStateToProps,
//   mapDispatchToProps
// )(withRouter(ActionList));
