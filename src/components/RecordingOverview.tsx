// @flow
import React, { Component } from 'react';

import Table from 'react-bootstrap/Table';
import { boolStr } from '../utils/utils';
import VideoDetail from './VideoDetail';
import Airing from '../utils/Airing';

type Props = { airing: Airing };

export default class RecordingOverview extends Component<Props> {
  props: Props;

  render() {
    const { airing } = this.props;
    const { videoDetails } = airing;

    return (
      <>
        <Table size="sm" borderless>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{airing.videoDetails.state}</td>
              {airing.isEpisode ? (
                <>
                  <th>Season</th>
                  <td>{airing.episodeNum}</td>
                </> //
              ) : (
                <></> //
              )}
              <th>Watched</th>
              <td>{boolStr(airing.userInfo.watched)}</td>
            </tr>
          </tbody>
        </Table>
        <VideoDetail details={videoDetails} />
      </> //
    );
  }
}
