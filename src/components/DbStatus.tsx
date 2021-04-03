// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { recDbCreated } from '../utils/db';
import Build from './Build';
import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';
import { hasDevice } from '../utils/Tablo';

type DbProps = {};
type DbState = { dbAge: number };

export default class DbStatus extends Component<DbProps, DbState> {
  timer: IntervalID;

  // whether we're using short-poll because the db doesn't exit
  shortTimer: boolean;

  emptyPollInterval: number;

  rebuildPollInterval: number;

  autoRebuildInterval: number;

  // TODO: figure out the type.
  buildRef: any;

  psToken: null;

  constructor() {
    super();
    this.state = { dbAge: -1 };
    this.buildRef = React.createRef();
    this.shortTimer = true;
    this.emptyPollInterval = 5000; // 1 second
    this.rebuildPollInterval = 30000; // 30 seconds
    this.autoRebuildInterval = 30; // 30 minutes

    this.forceBuild = this.forceBuild.bind(this);
  }

  async componentDidMount() {
    const created = recDbCreated();
    if (!created)
      this.timer = setInterval(this.checkAge, this.emptyPollInterval);
    else this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
    this.psToken = PubSub.subscribe('DB_CHANGE', () => this.checkAge(false));
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    PubSub.unsubscribe(this.psToken);
  }

  checkAge = async (forceBuild?: boolean) => {
    const created = recDbCreated();

    if (!created && !forceBuild) {
      // if we're coming back through after 1st build,
      if (!this.shortTimer) {
        clearInterval(this.timer);
        this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
      }
      return;
    }

    if (this.shortTimer) {
      this.shortTimer = false;
      clearInterval(this.timer);
      this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
    }

    const dbTime = new Date(created).getTime();
    const diff = (Date.now() - dbTime) / 60 / 1000;
    this.setState({ dbAge: diff });

    const config = getConfig();
    let autoRebuild = true;
    if (Object.prototype.hasOwnProperty.call(config, 'autoRebuild')) {
      autoRebuild = config.autoRebuild;
    }

    if ((autoRebuild && diff > this.autoRebuildInterval) || forceBuild) {
      if (global.CONNECTED) this.buildRef.build();
      clearInterval(this.timer);
      this.timer = setInterval(this.checkAge, this.rebuildPollInterval);
    }
  };

  forceBuild = () => {
    this.checkAge(true);
  };

  render() {
    const { dbAge } = this.state;

    if (!hasDevice()) return '';

    const created = recDbCreated();
    let color = '';
    if (dbAge === -1) {
      color = 'text-danger';
    } else if (dbAge < 31) {
      color = 'text-success';
    } else if (dbAge < 120) {
      color = 'text-warning';
    } else {
      color = 'text-danger';
    }

    return (
      <div
        className="text-muted"
        style={{
          maxHeight: '16px',
          width: '140px'
        }}
      >
        <Row>
          <Col md="2" className="ml-2 pr-0 mr-0 pl-0 btn btn-xs smaller">
            <Build
              view="spinner"
              showDbTable={() => {}}
              ref={buildRef => (this.buildRef = buildRef)}
            />
          </Col>
          <Col md="auto" className="pl-0 ml-0">
            <div
              style={{ cursor: 'pointer' }}
              onClick={this.forceBuild}
              onKeyDown={this.forceBuild}
              role="button"
              tabIndex="0"
              className="pl-0 btn btn-xs smaller pr-0"
            >
              <span className={`fa fa-database pr-1 ${color}`} />

              <RelativeDate date={created} term="old" />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
