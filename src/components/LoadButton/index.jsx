import React from 'react';
import { remote } from 'electron';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';

import { fetchDatastackFromFile } from '../../server_requests';

export class LoadButton extends React.Component {
  /** Render a button that loads args from a datastack, parameterset, or logfile.
  * Opens an native OS filesystem dialog to browse to a file.
  * Extracts the args using datastack.py.
  */

  constructor(props) {
    super(props);
    this.browseFile = this.browseFile.bind(this);
  }

  async browseFile(event) {
    const data = await remote.dialog.showOpenDialog()
    if (data.filePaths.length) {
      const payload = { 
        datastack_path: data.filePaths[0]
      }
      const datastack = await fetchDatastackFromFile(payload)
      const specLoaded = await this.props.investGetSpec(datastack.model_run_name)
      if (specLoaded) { this.props.batchUpdateArgs(datastack['args']) }
    } else {
      console.log('load parameters canceled, no file selected')
    }
  }

  render() {
    return(
      <Button className="mx-3"
        onClick={this.browseFile}
        variant="primary">
        Load Parameters
      </Button>
    );
  }
}

LoadButton.propTypes = {
  argsToJsonFile: PropTypes.func,
  disabled: PropTypes.bool,
  investGetSpec: PropTypes.func,
  batchUpdateArgs: PropTypes.func
}

