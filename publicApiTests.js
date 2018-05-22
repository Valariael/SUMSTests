'use strict';

/* global QUnit */

const fetch = require('node-fetch');
const cp = require('child_process');

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
    if (str.length % 100 === 0) {
      str += '100';
    }
  } while (str.length <= 1500);

  return str;
}

function wait(ms) {
  const start = new Date().getTime();
  let end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

QUnit.module('Testing the API');

const localhost = 'http://127.0.0.1:8080/';

QUnit.test(
  'GET /api/1997PJE40/4/adrien@fake.example.org',
  async (assert) => {
    const url = localhost + 'api/1997PJE40/4/adrien@fake.example.org';
    const fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };

    let response = await fetch(url, fetchOptionsGET);

    assert.ok(
      response.ok,
      'GET on /api/1997PJE40/4/adrien@fake.example.org is OK.',
    );

    /*
    * Here we create the whole data with which we are going to compare the data
    * received from the API.
    */

    // First POST to get version number.

    const data = await response.json();

    // Creating default marks.

    const marking = createEmptyMarking(data.project.cohort.markingForm, data.version);

    const fetchOptionsPOST = {
      method: 'POST',
      body: JSON.stringify(marking),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake adrien',
      },
    };

    const versionReturned = await fetch(url, fetchOptionsPOST);
    const dataVersion = await versionReturned.json();

    // GET on https://sums-dev.jacek.cz/api/public/1997PJE40 to get cohort informations.

    const urlCohort =  localhost + 'api/public/1997PJE40';
    response = await fetch(urlCohort, fetchOptionsGET);

    // Adding all the data to the marking.

    marking.role = 'supervisor';
    marking.email = 'adrien@fake.example.org';
    marking.name = 'Fake adrien';
    marking.version = dataVersion.version;
    marking.project = {
      student: '4',
      studentName: 'Pawlikowski, Andy',
      title: 'fake-testing project',
    };
    marking.project.cohort = await response.json();
    marking.project.cohort.markingForm.prizes = [
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
    delete marking.project.cohort.projectSubmissionDeadline;

    // End of creation.

    response = await fetch(url, fetchOptionsGET);
    const dataToCompare = await response.json();

    assert.deepEqual(
      dataToCompare,
      marking,
      'The data received is correct.',
    );
  },
);

QUnit.test(
  'POST /api/1997PJE40/4/axel@fake.example.org',
  async (assert) => {
    const url = localhost + 'api/1997PJS40/3/axel@fake.example.org';
    let fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    let response = await fetch(url, fetchOptions);
    let data = await response.json();

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);

    assert.ok(
      response.ok,
      'POST on /api/1997PJS40/3/axel@fake.example.org is OK.',
    );

    /* fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);
    data = await response.json();
    let marking = createEmptyMarking(data.project.cohort.markingForm, data.version);
    marking.role = 'wrong_role'; */

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);

    assert.ok(
      !response.ok,
      'POST on /api/1997PJS40/3/axel@fake.example.org is not OK with wrong data.',
    );

    assert.equal(
      response.status,
      400,
      'When sending incorrect data, status 400 returned.',
    );

    assert.equal(
      response.statusText,
      'Bad Request',
      'The exception is `Bad Request`.',
    );

    fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);
    data = await response.json();

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake jack',
      },
    };
    response = await fetch(url, fetchOptions);

    assert.ok(
      !response.ok,
      'POST on /api/1997PJS40/3/axel@fake.example.org is not OK when using the wrong credentials.',
    );

    assert.equal(
      response.status,
      403,
      'When using wrong credentials, status 403 returned.',
    );

    assert.equal(
      response.statusText,
      'Forbidden',
      'The exception is `Forbidden`.',
    );

    fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);
    data = await response.json();
    const marking = createEmptyMarking(data.project.cohort.markingForm, data.version);
    marking.generalComments = reallyBigString();

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);

    assert.ok(
      response.ok,
      'POST on /api/1997PJS40/3/axel@fake.example.org is OK with a really big string as note.',
    );
  },
);

QUnit.test(
  'Test of fake authentication',
  async (assert) => {
    const url = localhost + 'api/ongoing-cohorts';
    let response = await fetch(url);

    assert.ok(
      !response.ok,
      'GET on /api/ongoing-cohort is not OK without auth.',
    );

    assert.equal(
      response.status,
      401,
      'When sending a wrong authentication token, status 401 returned.',
    );

    assert.equal(
      response.statusText,
      'Unauthorized',
      'The exception is `Unauthorized`.',
    );

    const fetchOptions = {
      method: 'GET',
      headers: { Authorization: 'Fake adrien' },
    };
    response = await fetch(url, fetchOptions);

    assert.ok(
      response.ok,
      'GET on /api/ongoing-cohort is OK with fake auth.',
    );
  },
);

QUnit.test(
  'Test of the version number',
  async (assert) => {
    const url = localhost + 'api/1997PJS40/3/axel@fake.example.org';
    let fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    let response = await fetch(url, fetchOptions);

    assert.ok(
      response.ok,
      'GET on /api/1997PJS40/3/axel@fake.example.org is OK.',
    );

    let data = await response.json();

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);
    const postReturn = await response.json();

    assert.ok(
      data.version < postReturn.version,
      'The new version number is superior to the old version number.',
    );

    fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);
    data = await response.json();

    assert.equal(
      data.version,
      postReturn.version,
      'The version number changed and is correct.',
    );

    data.version -= 1;

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);

    assert.ok(
      !response.ok,
      'POST on /api/1997PJS40/3/axel@fake.example.org is not OK with a wrong version number.',
    );

    assert.equal(
      response.status,
      409,
      'When sending a wrong version, status 409 returned.',
    );

    assert.equal(
      response.statusText,
      'Conflict',
      'The exception is a `Conflict`.',
    );
  },
);

QUnit.test(
  'GET /api/1997PJS40/6',
  async (assert) => {
    // Execute the shell command to restore datas.

    const command = cp.spawn('node', ['/var/www/html/projets/sums2017/tests/generate-simple-test-data.js', '-f', '--overwrite', '-n', 'restricted-tests-2']); // eslint-disable-line max-len

    // Uncomment the following function to see what do this command.
    /*
    command.stdout.on('data', (data) => {
      console.log('Message: ' + data);
    });
    */

    console.log('Restoration of datas.');
    command.on('close', () => {
      console.log('Restoration of datas complete.');
    });
    wait(15000); // Reset datas take a little too much time. If we don't do that, datas cannot be complete.

    let url = localhost + 'api/1997PJE40/6';

    // Here, we will see if access to this route is possible for someone who's not working on the project,
    // and check if everything is normal for the others.
    let fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };
    let responseAdrien = await fetch(url, fetchOptionsGET);
    assert.ok(
      responseAdrien.ok,
      'GET on /api/1997PJE40/6 is OK with the moderator.',
    );

    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    let responseAxel = await fetch(url, fetchOptionsGET);
    assert.ok(
      responseAxel.ok,
      'GET on /api/1997PJE40/6 is OK with the supervisor.',
    );

    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake jack',
      },
    };
    const response = await fetch(url, fetchOptionsGET);
    assert.ok(
      !response.ok,
      'GET on /api/1997PJE40/6 is not OK with another user.',
    );

    let dataAdrien = await responseAdrien.json();
    let dataAxel = await responseAxel.json();

    // Here we check if informations given by the route are correct.
    // The data samples used below to do deepEquals were found by using curl.

    assert.deepEqual(
      dataAdrien,
      {
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            role: 'supervisor',
            email: 'axel@fake.example.org',
            name: 'Fake axel',
            finalizedMark: null,
          },
          {
            role: 'moderator',
            email: 'adrien@fake.example.org',
            version: 12,
            name: 'Fake adrien',
          },
        ],
      },
      'Informations are correct for marker Adrien.',
    );

    assert.deepEqual(
      dataAxel,
      {
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            role: 'supervisor',
            email: 'axel@fake.example.org',
            version: 11,
            name: 'Fake axel',
          },
          {
            role: 'moderator',
            email: 'adrien@fake.example.org',
            name: 'Fake adrien',
            finalizedMark: null,
          },
        ],
      },
      'Informations are correct for marker Axel.',
    );

    // Here, we will omplete marks for a project.
    url = localhost + 'api/1997PJE40/6/adrien@fake.example.org';
    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };
    responseAdrien = await fetch(url, fetchOptionsGET);

    assert.ok(
      responseAdrien.ok,
      'GET on /api/1997PJE40/6/adrien@fake.example.org is OK.',
    );

    dataAdrien = await responseAdrien.json();
    let marking = createEmptyMarking(dataAdrien.project.cohort.markingForm, dataAdrien.version);
    let fetchOptionsPOST = {
      method: 'POST',
      body: JSON.stringify(marking),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake adrien',
      },
    };
    await fetch(url, fetchOptionsPOST);
    responseAdrien = await fetch(url, fetchOptionsGET);
    let mark = 80;
    dataAdrien = await responseAdrien.json();
    marking = createMarking(dataAdrien.project.cohort.markingForm, dataAdrien.version, mark);
    fetchOptionsPOST = {
      method: 'POST',
      body: JSON.stringify(marking),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake adrien',
      },
    };
    responseAdrien = await fetch(url, fetchOptionsPOST);
    assert.ok(responseAdrien, 'should work');
    responseAdrien = await fetch(url, fetchOptionsGET);
    dataAdrien = await responseAdrien.json();

    marking.version = dataAdrien.version;
    dataAdrien.finalizedMark = mark;
    fetchOptionsPOST.body = JSON.stringify(dataAdrien);

    await fetch(url, fetchOptionsPOST);
    assert.ok(responseAdrien, 'should work again');
    responseAdrien = await fetch(url, fetchOptionsGET);
    dataAdrien = await responseAdrien.json();

    // Here, we will check if new informations given by the routes are correct.
    url = localhost + 'api/1997PJE40/6';

    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };
    responseAdrien = await fetch(url, fetchOptionsGET);
    assert.ok(
      responseAdrien.ok,
      'GET on /api/1997PJE40/6 is OK with the moderator.',
    );
    dataAdrien = await responseAdrien.json();
    delete dataAdrien.markings[1].version;
    assert.deepEqual(
      dataAdrien,
      {
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            role: 'supervisor',
            email: 'axel@fake.example.org',
            name: 'Fake axel',
            finalizedMark: null,
          },
          {
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line max-len
            marks: {
              'Evaluation against requirements': {
                note: '',
                mark: 80,
              },
              'Discussion of verification and validation': {
                mark: 80,
                note: '',
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 80,
              },
              'Attributes of the solution': {
                note: '',
                mark: 80,
              },
              'Discussion of implementation': {
                note: '',
                mark: 80,
              },
              'Methodological approach': {
                note: '',
                mark: 80,
              },
              'Critical review of relevant literature': {
                note: '',
                mark: 80,
              },
              'Analysis and discussion of the IT design': {
                note: '',
                mark: 80,
              },
              'Structure and presentation': {
                mark: 80,
                note: '',
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 80,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 80,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 80,
              },
              'Specification and discussion of the requirements': {
                note: '',
                mark: 80,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'moderator',
            adjustment: 0,
            email: 'adrien@fake.example.org',
            finalizedMark: 80,
            prizeNominations: [],
            name: 'Fake adrien',
          },
        ],
      },
      'Informations are correct for marker Adrien.',
    );

    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    responseAxel = await fetch(url, fetchOptionsGET);
    assert.ok(
      responseAxel.ok,
      'GET on /api/1997PJE40/6 is OK with the supervisor.',
    );
    dataAxel = await responseAxel.json();
    assert.deepEqual(
      dataAxel,
      {
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            version: 11,
            role: 'supervisor',
            email: 'axel@fake.example.org',
            name: 'Fake axel',
          },
          {
            role: 'moderator',
            email: 'adrien@fake.example.org',
            name: 'Fake adrien',
            finalizedMark: true,
          },
        ],
      },
      'Informations are correct for marker Axel.',
    );

    // Here, we will create marks for the second marker.
    url = localhost + 'api/1997PJE40/6/axel@fake.example.org';
    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    responseAxel = await fetch(url, fetchOptionsGET);

    assert.ok(
      responseAxel.ok,
      'GET on /api/1997PJE40/6/axel@fake.example.org is OK.',
    );

    dataAxel = await responseAxel.json();
    marking = createEmptyMarking(dataAxel.project.cohort.markingForm, dataAxel.version);
    fetchOptionsPOST = {
      method: 'POST',
      body: JSON.stringify(marking),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    await fetch(url, fetchOptionsPOST);
    responseAxel = await fetch(url, fetchOptionsGET);
    mark = 60;
    dataAxel = await responseAxel.json();
    marking = createMarking(dataAxel.project.cohort.markingForm, dataAxel.version, mark);
    fetchOptionsPOST = {
      method: 'POST',
      body: JSON.stringify(marking),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    responseAxel = await fetch(url, fetchOptionsPOST);
    assert.ok(responseAxel, 'should work');
    responseAxel = await fetch(url, fetchOptionsGET);
    dataAxel = await responseAxel.json();

    marking.version = dataAxel.version;
    dataAxel.finalizedMark = mark;
    fetchOptionsPOST.body = JSON.stringify(dataAxel);

    await fetch(url, fetchOptionsPOST);
    assert.ok(responseAxel, 'should work again');
    responseAxel = await fetch(url, fetchOptionsGET);
    dataAxel = await responseAxel.json();

    // Here, we will check again if new informations given by the routes are correct.
    url = localhost + 'api/1997PJE40/6';

    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };
    responseAdrien = await fetch(url, fetchOptionsGET);
    assert.ok(
      responseAdrien.ok,
      'GET on /api/1997PJE40/6 is OK with the moderator.',
    );
    dataAdrien = await responseAdrien.json();
    delete dataAdrien.markings[1].version;
    delete dataAdrien.markings[0].version;

    assert.deepEqual(
      dataAdrien,
      {
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            adjustment: 0,
            email: 'axel@fake.example.org',
            finalizedMark: 60,
            prizeNominations: [],
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line max-len
            marks: {
              'Structure and presentation': {
                mark: 60,
                note: '',
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 60,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 60,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 60,
              },
              'Specification and discussion of the requirements': {
                mark: 60,
                note: '',
              },
              'Evaluation against requirements': {
                mark: 60,
                note: '',
              },
              'Discussion of verification and validation': {
                note: '',
                mark: 60,
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 60,
              },
              'Attributes of the solution': {
                note: '',
                mark: 60,
              },
              'Discussion of implementation': {
                note: '',
                mark: 60,
              },
              'Methodological approach': {
                mark: 60,
                note: '',
              },
              'Critical review of relevant literature': {
                mark: 60,
                note: '',
              },
              'Analysis and discussion of the IT design': {
                note: '',
                mark: 60,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'supervisor',
            name: 'Fake axel',
          },
          {
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line
            marks: {
              'Structure and presentation': {
                mark: 80,
                note: '',
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 80,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 80,
              },
              'Statement of project’s context, aims and objectives': {
                mark: 80,
                note: '',
              },
              'Specification and discussion of the requirements': {
                mark: 80,
                note: '',
              },
              'Evaluation against requirements': {
                mark: 80,
                note: '',
              },
              'Discussion of verification and validation': {
                mark: 80,
                note: '',
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 80,
              },
              'Attributes of the solution': {
                mark: 80,
                note: '',
              },
              'Discussion of implementation': {
                note: '',
                mark: 80,
              },
              'Methodological approach': {
                note: '',
                mark: 80,
              },
              'Critical review of relevant literature': {
                note: '',
                mark: 80,
              },
              'Analysis and discussion of the IT design': {
                mark: 80,
                note: '',
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'moderator',
            adjustment: 0,
            email: 'adrien@fake.example.org',
            finalizedMark: 80,
            prizeNominations: [],
            prizeJustification: '',
            name: 'Fake adrien',
          },
        ],
      },
      'Informations are correct for marker Adrien.',
    );

    fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    responseAxel = await fetch(url, fetchOptionsGET);
    assert.ok(
      responseAxel.ok,
      'GET on /api/1997PJE40/6 is OK with the moderator.',
    );
    dataAxel = await responseAxel.json();
    delete dataAxel.markings[1].version;
    delete dataAxel.markings[0].version;

    assert.deepEqual(
      dataAxel,
      {
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            adjustment: 0,
            email: 'axel@fake.example.org',
            finalizedMark: 60,
            prizeNominations: [],
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line
            marks: {
              'Critical review of relevant literature': {
                mark: 60,
                note: '',
              },
              'Analysis and discussion of the IT design': {
                mark: 60,
                note: '',
              },
              'Structure and presentation': {
                note: '',
                mark: 60,
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 60,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 60,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 60,
              },
              'Specification and discussion of the requirements': {
                note: '',
                mark: 60,
              },
              'Evaluation against requirements': {
                note: '',
                mark: 60,
              },
              'Discussion of verification and validation': {
                note: '',
                mark: 60,
              },
              'Evidence of project planning and management': {
                mark: 60,
                note: '',
              },
              'Attributes of the solution': {
                note: '',
                mark: 60,
              },
              'Discussion of implementation': {
                mark: 60,
                note: '',
              },
              'Methodological approach': {
                note: '',
                mark: 60,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'supervisor',
            name: 'Fake axel',
          },
          {
            email: 'adrien@fake.example.org',
            finalizedMark: 80,
            prizeNominations: [],
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line
            marks: {
              'Discussion of verification and validation': {
                note: '',
                mark: 80,
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 80,
              },
              'Attributes of the solution': {
                note: '',
                mark: 80,
              },
              'Discussion of implementation': {
                note: '',
                mark: 80,
              },
              'Methodological approach': {
                note: '',
                mark: 80,
              },
              'Critical review of relevant literature': {
                note: '',
                mark: 80,
              },
              'Analysis and discussion of the IT design': {
                note: '',
                mark: 80,
              },
              'Structure and presentation': {
                note: '',
                mark: 80,
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 80,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 80,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 80,
              },
              'Specification and discussion of the requirements': {
                note: '',
                mark: 80,
              },
              'Evaluation against requirements': {
                note: '',
                mark: 80,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'moderator',
            adjustment: 0,
            name: 'Fake adrien',
          },
        ],
      },
      'Informations are correct for marker Axel.',
    );
  },
);
