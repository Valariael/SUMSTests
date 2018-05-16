'use strict';

/* global QUnit */

const fetch = require('node-fetch');
const gstd = require('./tools/generate-simple-test-data');

console.log(gstd.cohorts);

/*
 *  createEmptyMarking creates the empty marking that is required to add a first mark,
 *  it uses the parameters to create each marking category as if they were empty.
 */
function createEmptyMarking(markingForm, version) {
  const markings = {};

  markings.adjustment = 0;
  markings.generalComments = '';
  markings.marks = {};
  for (let i=0; i<markingForm.categories.length; i+=1) {
    if (Object.hasOwnProperty.call(markingForm.categories[i], 'name')) {
      markings.marks['' + String(markingForm.categories[i].name)] = { note: '' };
    }
  }
  markings.misconductConcern = false;
  markings.plagiarismConcern = false;
  markings.prizeJustification = '';
  markings.prizeNominations = [];
  markings.unfairnessComment = '';
  markings.version = version;

  return markings;
}

/*
 *  createMarkingsFinalized creates a finalized marking, it uses the parameters
 *  to create each marking category with the same value `finalMark`.
 */
function createMarkingsFinalized(markingForm, version, finalMark) {
  const markings = {};

  markings.adjustment = 0;
  markings.generalComments = 'some comments '*50;
  markings.marks = {};
  for (let i=0; i<markingForm.categories.length; i+=1) {
    if (Object.hasOwnProperty.call(markingForm.categories[i], 'name')) {
      markings.marks['' + String(markingForm.categories[i].name)] = { mark: finalMark, note: '' };
    }
  }
  markings.misconductConcern = false;
  markings.plagiarismConcern = false;
  markings.prizeJustification = '';
  markings.prizeNominations = [];
  markings.unfairnessComment = '';
  markings.version = version;
  markings.finalizedMark = finalMark;

  return markings;
}

function reallyBigString() {
  let str = '';

  do {
    str += '.';
    if (str.length % 1000 === 0) {
      str += '1000';
    }
  } while (str.length < 15000);

  return str;
}

QUnit.module('Testing the API');

// We'll have to make a loop that goes through all the routes
const cohort = '1997PJE40';
const studentId = 1001;
const markerEmail = 'axel@fake.example.org';

// TESTING WITH CORRECT FAKE EMAIL

QUnit.test(
  'GET /api/:cohort/:studentId/:markerEmail',
  async (assert) => {
    const emailParts = markerEmail.split('@');
    const url = 'http://localhost:8080/api/'+ cohort +'/'+ studentId +'/'+ markerEmail;
    const fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake '+ emailParts[0],
      },
    };

    let response = await fetch(url, fetchOptionsGET);

    assert.ok(
      response.ok,
      'GET on /api/'+ cohort +'/'+ studentId +'/'+ markerEmail +' is OK.',
    );

    /*
    * Here we create the whole data with which we are going to compare the data
    * received from the API.
    */

    // First POST to get version number.

    const data = await response.json();

    const form = createEmptyMarking(data);

    const fetchOptionsPOST = {
      method: 'POST',
      body: JSON.stringify(form),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake '+ emailParts[0],
      },
    };

    const versionReturned = await fetch(url, fetchOptionsPOST);
    const dataVersion = await versionReturned.json();

    // GET on https://sums-dev.jacek.cz/api/public/:cohort to get cohort informations.

    const urlCohort =  'http://localhost:8080/api/public/'+ cohort;

    response = await fetch(urlCohort, fetchOptionsGET);
    const dataCohort = await response.json();

    // Creating default marks.

    const project = createEmptyMarking(data);

    project.role = data.role;
    project.email = markerEmail;
    project.name = 'Fake '+ emailParts[0];
    project.version = dataVersion.version;
    project.project = {
      student: studentId,
      studentName: data.project.studentName,
      title: data.project.title,
    };
    project.project.cohort = dataCohort;
    project.project.cohort.markingForm.prizes = [
      {
        id: 1,
        name: 'Clever Touch Prize for the most Original Business Systems Project',
      },
      {
        name: 'SoC Prize for Best Information Systems Project',
        id: 2,
      },
      {
        id: 4,
        name: 'SoC David Callear Memorial Prize',
      },
      {
        name: 'SoC Prize for Best Business Solution Project',
        id: 5,
      },
      {
        id: 7,
        name: 'BAE Systems Project Prize in Software Engineering',
      },
      {
        id: 10,
        name: 'SoC Prize for best Computer Science project.',
      },
    ];
    delete project.project.cohort.projectSubmissionDeadline;

    // End of creation.

    response = await fetch(url, fetchOptionsGET);

    assert.deepEqual(
      await response.json(),
      project,
      'The data received is correct.',
    );
  },
);
