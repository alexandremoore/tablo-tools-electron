// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { LinkContainer } from 'react-router-bootstrap';

import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import routes from '../constants/routes.json';

import Settings from '../components/Settings';

type Props = { saveFunc: () => void, location: any };

class SettingsPage extends Component<Props> {
  props: Props;

  render() {
    console.log('props', this.props);

    const { saveFunc, location } = this.props;

    let content = <Settings />;
    switch (location.pathname) {
      case routes.FILENAMETPLs:
        content = 'test!';
        break;
      default:
    }

    // if (location.pathname === routes.SHOWS) {
    //   ddClass = 'primary';
    // }

    return (
      <div className="section">
        <div>
          <Alert variant="primary" className="p-2 m-2">
            <Row>
              <Col md="2" className="pt-2">
                <h4 className="pl-2">Settings</h4>
              </Col>
              <Col>
                <ButtonGroup className="pt-1">
                  <LinkContainer activeClassName="active" to={routes.SETTINGS}>
                    <Button size="sm" variant="light" as="button" title="Home">
                      General
                    </Button>
                  </LinkContainer>
                  <LinkContainer
                    activeClassName="active"
                    to={routes.FILENAMETPLs}
                  >
                    <Button
                      size="sm"
                      variant="light"
                      as="button"
                      title="Watch Live"
                    >
                      Naming
                    </Button>
                  </LinkContainer>
                </ButtonGroup>

                <Button
                  size="sm"
                  className="mt-1 ml-5"
                  variant="outline-light"
                  type="button"
                  onClick={saveFunc}
                >
                  Save
                </Button>
              </Col>
            </Row>
          </Alert>
          <Row>
            <Col />
          </Row>
        </div>

        {content}
      </div>
    );
  }
}

export default withRouter(SettingsPage);
