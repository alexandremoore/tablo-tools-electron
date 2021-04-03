// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Alert from 'react-bootstrap/Alert';
import MediumPie from './MediumPie';
import { comskipAvailable } from '../utils/Tablo';

type Props = {};
type State = {
  skipStats: Object,
  skipErrors: Object,
  showsData: Array<Object>,
  recCount: number
};

export default class ComskipDetails extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { skipStats: {}, skipErrors: {}, recCount: 0, showsData: [] };

    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.refresh();
    if (comskipAvailable())
      this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): * {
    if (this.psToken !== null) PubSub.unsubscribe(this.psToken);
  }

  psToken = null;

  async refresh() {
    if (!comskipAvailable()) return;

    // const comskip = await RecDb.asyncCount({ 'video_details.comskip': { $exists: true } });
    const recs = await global.RecDb.asyncFind({});

    const skipStats = { ready: 0, none: 0, error: 0, unk: 0 };
    const skipErrors = {};

    const shows = {};
    recs.forEach(rec => {
      const cs = rec.video_details.comskip;
      // fixes Sentry-2Y, hopefully exposes real problem.
      if (cs) {
        const title = rec.airing_details.show_title;
        let { state } = cs;
        if (!state) state = 'unk';
        skipStats[state] = skipStats[state] ? skipStats[state] + 1 : 1;
        if (cs.state === 'ready')
          shows[title] = shows[title] ? shows[title] + 1 : 1;

        if (cs.error) {
          if (cs.error in skipErrors) {
            skipErrors[cs.error] += 1;
          } else {
            skipErrors[cs.error] = 0;
          }
        }
      }
    });

    const showsData = [];
    Object.keys(shows).forEach(key => {
      showsData.push({ id: key, label: key, value: shows[key] });
    });

    await this.setState({
      recCount: recs.length,
      skipStats,
      skipErrors,
      showsData
    });
  }

  render() {
    const { recCount, skipStats, skipErrors, showsData } = this.state;

    if (!skipStats) return <></>;

    if (!recCount)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );
    const data = [];
    Object.keys(skipErrors).forEach(key => {
      data.push({ id: key, label: key, value: skipErrors[key] });
    });

    const topStats = [
      { id: 'ready', label: 'ready', value: skipStats.ready },
      { id: 'errors', label: 'errors', value: skipStats.error },
      { id: 'unknown', label: 'unknown', value: skipStats.none }
    ];

    return (
      <>
        <div className="stats-header">by status</div>
        <MediumPie data={topStats} scheme="accent" />

        <div className="stats-header">by show</div>

        <MediumPie data={showsData} scheme="set2" />
        <div className="stats-header">error details</div>
        <MediumPie data={data} scheme="set2" />
      </>
    );
  }
}
