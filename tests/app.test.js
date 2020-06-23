import path from 'path';
import fs from 'fs';
import React from 'react';
import { remote } from 'electron';
import { fireEvent, render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import App from '../src/app';
import { getInvestList, getFlaskIsReady } from '../src/server_requests';
jest.mock('../src/server_requests');

getFlaskIsReady.mockResolvedValue('Flask ready');
getInvestList.mockResolvedValue({});

const TEST_JOB_DATA = path.join(__dirname, './data/jobdb.json');

test('Recent Sessions: each has a button', async () => {
  const { getByText, getByLabelText, debug } = render(
    <App appdata={TEST_JOB_DATA}/>);
  const db = JSON.parse(fs.readFileSync(TEST_JOB_DATA));

  await waitFor(() => {
    Object.keys(db).forEach(job => {
      expect(getByText(db[job].workspace.directory)).toBeTruthy();
    })
  })
})

test('Settings dialog interactions: logging level', async () => {
  
  const DEFAULT = 'INFO';

  const { getByText, getByLabelText, debug } = render(
    <App appdata={TEST_JOB_DATA}/>);

  // Check the default settings
  fireEvent.click(getByText('Settings'));
  await waitFor(() => { 
    // waiting because the selected value depends on passed props
    expect(getByText(DEFAULT).selected).toBeTruthy();
  })

  // Change the select input and cancel -- expect default selected
  fireEvent.change(getByLabelText('Logging threshold'),
    { target: { value: 'DEBUG' } })
  fireEvent.click(getByText('Cancel'));
  // fireEvent.click(getByText('Settings'));  // why is this unecessary?
  expect(getByText(DEFAULT).selected).toBeTruthy();

  // Change the select input and save -- expect new value selected
  fireEvent.change(getByLabelText('Logging threshold'),
    { target: { value: 'DEBUG' } })
  fireEvent.click(getByText('Save Changes'));
  // fireEvent.click(getByText('Settings'));  // why is this unecessary?
  expect(getByText('DEBUG').selected).toBeTruthy();
})

test('Settings dialog interactions: n workers', async () => {
  const defaultValue = '-1';
  const newValue = '2'
  const badValue = 'a'
  const labelText = 'Taskgraph n_workers parameter'

  const { getByText, getByLabelText, debug } = render(
    <App appdata={TEST_JOB_DATA}/>);

  fireEvent.click(getByText('Settings'));
  const input = getByLabelText(labelText, { exact: false })
  
  // Check the default settings
  await waitFor(() => { 
    // waiting because the text value depends on passed props
    expect(input).toHaveValue(defaultValue);
  })

  // Change the value and cancel -- expect default value
  fireEvent.change(input, { target: { value: newValue } })
  fireEvent.click(getByText('Cancel'));
  expect(input).toHaveValue(defaultValue);

  // Change the value and save -- expect new value selected
  fireEvent.change(input, { target: { value: newValue } })
  expect(input).toHaveValue(newValue); // of course, we just set it
  // The real test: still newValue after saving and re-opening
  fireEvent.click(getByText('Save Changes'));
  fireEvent.click(getByText('Settings'));
  await waitFor(() => {  // the value to test is inherited through props
    expect(input).toHaveValue(newValue);
  })

  // Change to bad value -- expect invalid signal
  fireEvent.change(input, { target: { value: badValue } })
  expect(input.classList.contains('is-invalid')).toBeTruthy();
  expect(getByText('Save Changes')).toBeDisabled();
})