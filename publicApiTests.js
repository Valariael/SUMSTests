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

// The test below has to be rewritten entirely
/*
QUnit.test(
  'GET /api/ongoing-cohorts',
  async (assert) => {
    // Marking a project on both side for testing purpose

    let url = 'https://sums-dev.jacek.cz/api/1997PJE40/2/axel@fake.example.org';
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
      body: JSON.stringify(createMarkingsFromDataWithMarks(data, 50)),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake axel',
      },
    };
    await fetch(url, fetchOptions);

    url = 'https://sums-dev.jacek.cz/api/1997PJE40/2/jack@fake.example.org';
    fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake jack',
      },
    };
    response = await fetch(url, fetchOptions);
    data = await response.json();

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(createMarkingsFromDataWithMarks(data, 50)),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake jack',
      },
    };
    await fetch(url, fetchOptions);

    url = 'https://sums-dev.jacek.cz/api/ongoing-cohorts';
    response = await fetch(url);

    assert.ok(
      !response.ok,
      'GET on /api/ongoing-cohort is not OK.',
    );

    fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake axel',
      },
    };
    response = await fetch(url, fetchOptions);

    assert.ok(
      response.ok,
      'GET on /api/ongoing-cohort is OK.',
    );

    // mark a project on both sides

    data = await response.json();
    console.log(data);
    for (let i=0; i<data.length; i+=1) {
      assert.ok(
        !data.closed,
        'The cohort ' + data[i].year + data[i].unit + ' is not closed.',
      );
      const projects = data[i].projects;
      for (let j=0; j<projects.length; j+=1) {
        console.log('projet ' + j);
        console.log(projects[j]);
        const urlProject = 'https://sums-dev.jacek.cz/api/' + data[i].year + data[i].unit + '/' + projects[j].student + '/axel@fake.example.org'; // eslint-disable-line max-len
        assert.ok(
          Object.hasOwnProperty.call(projects[j], 'studentName'),
          '`studentName` is set in the project ' + projects[j].title + '.',
        );
        const markings = projects[j].markings;
        for (let k=0; k<markings.length; k+=1) {
          console.log('markings : ' + k);
          console.log(markings[k]);

          // IF the user is the marker
          if (markings[k].email === 'axel@fake.example.org') {
            // IF he finished marking
            if (typeof markings[k].finalizedMark === 'number') {
              const responseProject = await fetch(urlProject, fetchOptions); // eslint-disable-line no-await-in-loop
              const dataProject = await responseProject.json(); // eslint-disable-line no-await-in-loop
              delete dataProject.project;
              delete dataProject.name;
            } else if (!Object.hasOwnProperty.call(markings[k], 'finalizedMark')) {
              // IF he hasn't finished marking
              const responseProject = await fetch(urlProject, fetchOptions); // eslint-disable-line no-await-in-loop
              const dataProject = await responseProject.json(); // eslint-disable-line no-await-in-loop
              delete dataProject.project;
              delete dataProject.name;
              assert.deepEqual(
                markings[k],
                dataProject,
                'The data is correct when the current useris the marker and hasn\'nt finished marking.',
              );
            } else {
              // IF he didn't start marking

            }
          }

          // IF the user is not the marker AND another user hasn't marked yet
          if (markings[k].email !== 'axel@fake.example.org' &&  typeof markings[(k+1)%markings.length].finalizedMark === 'number') { // eslint-disable-line max-len
            assert.ok(
              !Object.hasOwnProperty.call(markings[k], 'marks'),
              'The marking form is not present for other users.',
            );

            assert.ok(
              Object.hasOwnProperty.call(markings[k], 'role') && Object.hasOwnProperty.call(markings[k], 'email') && Object.hasOwnProperty.call(markings[k], 'finalizedMark'), // eslint-disable-line max-len
              'For others users, returns role, email and finalizedMark.',
            );

            assert.ok(
              data[i].projects[j].markings[k].finalizedMark === null || data[i].projects[j].markings[k].finalizedMark,
              'For other users, `finalizedMark` is null or true.',
            );
          } else { // maybe deepEqual with data get from markings ?

          }
        }
      }
    }

    // Create the enormous data to compare with.

    // Check that depending of the user we don't get the same stuff.

    // Check that the projects in there are all the user's projects.
  },
);

const http = 'http://127.0.0.1:8080/';

QUnit.test(
  'GET /api/1997PJS40/6',
  async (assert) => {
    const url = http + 'api/1997PJE40/6';
    let fetchOptionsGET = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };
    const responseAdrien = await fetch(url, fetchOptionsGET);
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

    const responseAxel = await fetch(url, fetchOptionsGET);

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

    const dataAdrien = await responseAdrien.json();
    const dataAxel = await responseAxel.json();

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

    // Trying here to finalize the markings on a project, but we're still working on it.

    /* url = http + 'api/1997PJE40/6/adrien@fake.example.org';
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
    const marking = createMarkingsFromData(dataAdrien);

    Object.keys(marking.marks).forEach((key) => {
      marking.marks[key].value = 80;
    });
    marking.generalComments = 'general comments ' * 10;

    const fetchOptionsPOST = {
      method: 'POST',
      body: JSON.stringify(marking),
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Fake adrien',
      },
    };

    responseAdrien = await fetch(url, fetchOptionsPOST);
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    console.log(await responseAdrien.json());
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

    url = http + 'api/1997PJE40/6';
    responseAdrien = await fetch(url, fetchOptionsGET);
    console.log('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
    console.log(await responseAdrien.json());
    console.log('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO'); */

    /*
    * Should try what happened when both marker have put a mark and check if both markers can see the same informations.
    */

    // Execute the shell command to restore datas.

    // const command = cp.spawn('node', ['toools/generate-simple-test-data.js', '-f', '--overwrite', '-n', 'restricted-tests-2']); // eslint-disable-line max-len

// Uncomment the following function to see what do the command.
/*
    command.stdout.on('data', (data) => {
      console.log('Message: ' + data);
    });
    */
/*
    console.log('Restoration of datas.');
    command.on('close', () => {
      console.log('Restoration of datas complete.');
    });
  },
);
*/
