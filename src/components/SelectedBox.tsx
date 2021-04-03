// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { bindActionCreators } from 'redux';

import { DropdownButton, ButtonGroup } from 'react-bootstrap';

import DropdownItem from 'react-bootstrap/DropdownItem';
import routes from '../constants/routes.json';
import * as ActionListActions from '../actions/actionList';
import * as SearchActions from '../actions/search';

import Airing from '../utils/Airing';
import { asyncForEach } from '../utils/utils';
import ConfirmDelete from './ConfirmDelete';

type State = {};
type Props = {
  actionList: Array<Airing>,
  bulkAddAirings: (airings: Array<Airing>) => void,
  bulkRemAirings: () => void,
  history: any
};

class SelectedBox extends Component<Props, State> {
  initialState: State;

  setStateStore(...args: Array<Object>) {
    const values = args[0];
    this.setState(values);
    const cleanState = this.state;

    localStorage.setItem('SelectLogoBoxState', JSON.stringify(cleanState));
  }

  addAll = async () => {
    const { bulkAddAirings } = this.props;
    const recs = await global.RecDb.asyncFind({});
    const actionList = [];
    await asyncForEach(recs, async doc => {
      try {
        const rec = await Airing.create(doc);
        actionList.push(rec);
      } catch (e) {
        console.log('Unable to load Airing data: ', e);
        console.log(doc);
        throw e;
      }
    });
    bulkAddAirings(actionList);
  };

  render() {
    const { actionList, bulkRemAirings } = this.props;

    const title = (
      <>
        <span className="fa fa-shopping-cart pr-1" />
        {actionList.length}
      </> //
    );
    const { history } = this.props;

    const delInner = (
      <>
        <span className="fa fa-trash-alt pr-2" />
        Delete
      </>
    ); //

    return (
      <div className="selected-basket smaller text-primary pt-2">
        <DropdownButton
          as={ButtonGroup}
          title={title}
          variant="outline-secondary"
        >
          {actionList.length > 0 ? (
            <>
              <DropdownItem onClick={() => history.push(routes.SELECTED)}>
                <span>
                  <span className="fa fa-search pr-2" />
                  View
                </span>
              </DropdownItem>
              <DropdownItem onClick={() => history.push(routes.EXPORT)}>
                <span>
                  <span className="fa fa-download pr-2" />
                  Export
                </span>
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <ConfirmDelete label="Delete" button={delInner} />
              </DropdownItem>
              <hr className="m-1 p-0" />
              <DropdownItem onClick={() => bulkRemAirings()}>
                <span>
                  <span className="fa fa-minus pr-2" />
                  Clear All
                </span>
              </DropdownItem>
            </> //
          ) : (
            ''
          )}
          <DropdownItem onClick={this.addAll}>
            <span>
              <span className="fa fa-plus pr-2" />
              Add All Recordings
            </span>
          </DropdownItem>
        </DropdownButton>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { ...ActionListActions, ...SearchActions },
    dispatch
  );
};

const mapStateToProps = (state: any) => {
  return {
    actionList: state.actionList
  };
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(SelectedBox));
