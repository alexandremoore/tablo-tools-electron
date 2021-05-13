import React, { Component } from 'react';

import Store from 'electron-store';
import Modal from './ModalExtended';
import Button from './ButtonExtended';
import getConfig, { setConfigItem } from '../utils/config';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import SentryToggle from '../utils/sentryToggle';

type Props = Record<string, never>;

type State = {
  show: boolean;
  requests: PermissionRequestsType;
};

export type PermissionRequestsType = {
  allowErrorReport: boolean;
  allowAutoUpdate: boolean;
};

export const defaultPermissionRequests: PermissionRequestsType = {
  allowErrorReport: false,
  allowAutoUpdate: false,
};
export default class PermissionRequests extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const store = new Store();
    const requests = Object.assign(
      defaultPermissionRequests,
      store.get('PermissionRequests')
    );
    let show = false;
    Object.keys(requests).forEach((key) => {
      if (requests[key] === false) show = true;
    });
    this.state = {
      show,
      requests,
    };
    (this as any).handleClose = this.handleClose.bind(this);
    (this as any).setOption = this.setOption.bind(this);
  }

  handleClose() {
    const { requests } = this.state;
    const store = new Store();
    const markedRequests: Record<string, any> = {};
    Object.keys(requests).forEach((key) => {
      markedRequests[key] = true;
    });
    store.set('PermissionRequests', markedRequests);
    this.setState({
      show: false,
    });
  }

  setOption = (
    _: React.SyntheticEvent<HTMLInputElement>,
    optionName: string
  ): void => {
    const { requests } = this.state;

    if (optionName === 'allowErrorReport') {
      requests[optionName] = !requests[optionName];

      SentryToggle(requests[optionName]);

      setConfigItem({ allowErrorReport: !requests[optionName] });
      this.setState({
        requests,
      });
    }

    if (optionName === 'allowAutoUpdate') {
      requests[optionName] = !requests[optionName];
      setConfigItem({ allowAutoUpdate: !requests[optionName] });
      this.setState({
        requests,
      });
    }
  };

  render() {
    const { show, requests } = this.state;
    const config = getConfig();
    return (
      <Modal
        size="md"
        show={show}
        onHide={this.handleClose}
        animation={false}
        centered
        scrollable
      >
        <Modal.Body>
          <h5 className="text-danger">
            Here are some <b className="text-dark">Settings</b> you should know
            about
          </h5>

          <div className="smaller muted mb-3">
            <i>
              We&apos;ll only ask once... You can change them anytime under
              Settings <span className="fa fa-cogs pl-1 pr-1" />
            </i>
          </div>

          {!requests.allowErrorReport ? (
            <div className="mb-2">
              <Checkbox
                handleChange={(_: any) => this.setOption(_, 'allowErrorReport')}
                label="Allow sending Error Reports?"
                checked={config.allowErrorReport ? CHECKBOX_ON : CHECKBOX_OFF}
              />

              <div className="pl-4 smaller">
                No personal data is collected - this simply notifies of us
                errors before you may post about it or even notice a problem. It
                does the <i>white screen of death</i> information gathering for
                you (and more).
              </div>
            </div>
          ) : (
            ''
          )}

          {!requests.allowAutoUpdate ? (
            <div className="mb-2">
              <Checkbox
                handleChange={(_: any) => this.setOption(_, 'autoUpdate')}
                label="Allow Automatic Updates?"
                checked={config.autoUpdate ? CHECKBOX_ON : CHECKBOX_OFF}
              />
              <div className="pl-4 smaller">
                On Linux and Windows, try to automatically download and install{' '}
                <b>new releases</b>. Regardless of this setting, a notification
                will appear when a new release is available.
              </div>
            </div>
          ) : (
            ''
          )}
        </Modal.Body>
        <Modal.Footer className="p-1">
          <Button size="sm" variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
