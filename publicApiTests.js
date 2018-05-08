'use strict';


/* global QUnit */

const fetch = require('node-fetch');

function createMarkingsFromData(data) {
  const markings = {};

  markings.adjustment = 0;
  markings.generalComments = '';
  markings.marks = [];
  for (let i=1; i<data.project.cohort.markingForm.categories.length; i+=1) {
    markings.marks['' + String(data.project.cohort.markingForm.categories[i].name)] = { value: null, note: '' };
  }
  markings.misconductConcern = false;
  markings.plagiarismConcern = false;
  markings.prizeJustification = '';
  markings.prizeNominations = [];
  markings.unfairnessComment = '';
  markings.version = data.version;

  return markings;
}

QUnit.module('Test of the data store');

QUnit.test(
  'GET /api/public/1999PJE40/criteria',
  async (assert) => {
    const url = 'https://sums-dev.jacek.cz/api/public/1999PJE40';
    const response = await fetch(url);
    assert.ok(
      response.ok,
      'GET on /api/public/1999PJE40/criteria is OK.',
    );

    const data = await response.json();

    assert.ok(
      Object.prototype.hasOwnProperty.call(data, 'year'),
      'data has a `year` attribute.',
    );
    assert.ok(
      Object.prototype.hasOwnProperty.call(data, 'closed'),
      'data has a `closed` attribute.',
    );
    assert.ok(
      Object.prototype.hasOwnProperty.call(data, 'coordinators'),
      'data has a `coordinators` attribute.',
    );
    assert.ok(
      Object.prototype.hasOwnProperty.call(data, 'projectSubmissionDeadline'),
      'data has a `projectSubmissionDeadline` attribute.',
    );
    assert.ok(
      Object.prototype.hasOwnProperty.call(data, 'unit'),
      'data has a `unit` attribute.',
    );
    assert.ok(
      Object.prototype.hasOwnProperty.call(data, 'markingForm'),
      'data has a `markingForm` attribute.',
    );

    assert.ok(
      Object.prototype.hasOwnProperty.call(data.markingForm, 'categories'),
      'data.markingForm has a `categories` attribute.',
    );

    const splitURL = url.split('/');

    assert.equal(
      splitURL[5],
      data.year + data.unit,
      'The cohort ID in the url is equal to the cohort ID of the data.',
    );

    assert.equal(
      typeof (data.closed),
      'boolean',
      'data.closed is a boolean.',
    );

    assert.equal(
      typeof (data.year),
      'number',
      'data.year is a number.',
    );

    assert.ok(
      Array.isArray(data.coordinators),
      'data.coordinators is an array.',
    );
    assert.ok(
      data.coordinators.length > 0,
      'data.coordinators is not empty.',
    );
    for (let i = 0; i < data.coordinators.length; i += 1) {
      assert.ok(
        typeof (data.coordinators[i]),
        'data.coordinators[' + i + '] is a string.',
      );
    }

    const dateRegexp = new RegExp(/^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/);
    assert.ok(
      dateRegexp.test(data.projectSubmissionDeadline),
      'data.projectSubmissionDeadline has a valid format.',
    );

    assert.equal(
      typeof (data.unit),
      'string',
      'data.unit is a string.',
    );
    assert.ok(
      data.unit !== '',
      'data.unit is not empty.',
    );

    assert.equal(
      typeof (data.year),
      'number',
      'data.year is a number',
    );

    assert.ok(
      Array.isArray(data.markingForm.categories),
      'data.markingForm.categories is an array.',
    );
    assert.ok(
      data.markingForm.categories.length > 0,
      'data.markingForm.categories is not empty.',
    );

    for (let i = 0; i < data.markingForm.categories.length; i += 1) {
      const category = data.markingForm.categories[i];
      const categoryStr = 'data.markingForm.categories[' + i + '].';

      assert.ok(
        Object.prototype.hasOwnProperty.call(data.markingForm.categories[i], 'compulsory'),
        'data.markingForm.categories[' + i + '] has a `compulsory` attribute.',
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(data.markingForm.categories[i], 'description'),
        'data.markingForm.categories[' + i + '] has a `description` attribute.',
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(data.markingForm.categories[i], 'name'),
        'data.markingForm.categories[' + i + '] has a `name` attribute.',
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(data.markingForm.categories[i], 'weight'),
        'data.markingForm.categories[' + i + '] has a `weight` attribute.',
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(data.markingForm.categories[i], 'levels'),
        'data.markingForm.categories[' + i + '] has a `levels` attribute.',
      );

      assert.equal(
        typeof (category.compulsory),
        'boolean',
        categoryStr + 'compulsory is a boolean.',
      );

      assert.equal(
        typeof (category.description),
        'string',
        categoryStr + 'description is a string.',
      );

      assert.equal(
        typeof (category.name),
        'string',
        categoryStr + 'name is a string.',
      );

      assert.equal(
        typeof (category.weight),
        'number',
        categoryStr + 'weight is a number.',
      );
      assert.ok(
        category.weight > 0,
        categoryStr + 'weight is positive.',
      );

      assert.ok(
        Array.isArray(category.levels),
        categoryStr + 'levels is an array.',
      );
      assert.ok(
        category.levels.length > 0,
        categoryStr + 'levels is not empty.',
      );

      let previousUpTo = 0;

      for (let i = 0; i < category.levels.length; i += 1) {
        const level = category.levels[i];
        const levelStr = categoryStr + 'levels[' + i + '].';

        assert.equal(
          typeof (level.negatives),
          'string',
          levelStr + 'negatives is a string.',
        );

        assert.equal(
          typeof (level.positives),
          'string',
          levelStr + 'positives is a string.',
        );

        assert.ok(
          level.positives !== '' || level.negatives !== '',
          levelStr + 'positives and ' + levelStr + 'negatives can\'t be empty at the same time.',
        );

        assert.equal(
          typeof (level.upTo),
          'number',
          levelStr + 'upTo is a number.',
        );

        assert.ok((previousUpTo < level.upTo), levelStr + 'upTo only increases.');
        previousUpTo = level.upTo;

        assert.ok(
          level.upTo <= 100,
          levelStr + 'upTo is lower than 100.',
        );
      }

      assert.equal(
        category.levels[category.levels.length-1].upTo,
        100,
        categoryStr + 'level[' + (category.levels.length-1) + '].upTo is equal to 100',
      );
    }
  },
);

QUnit.module('Test of the API');

QUnit.test(
  'GET /api/1997PJE40/4/adrien@fake.example.org',
  async (assert) => {
    const url = 'https://sums-dev.jacek.cz/api/1997PJE40/4/adrien@fake.example.org';
    let fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };
    let response = await fetch(url, fetchOptions);

    assert.ok(
      response.ok,
      'GET on /api/1997PJE40/4/adrien@fake.example.org is OK.',
    );

    // *******************************TEST plagiarismConcern SET TO true*****************

    let data = await response.json();

    assert.ok(
      !data.plagiarismConcern,
      'Cool it\'s on false',
    );

    data.plagiarismConcern = true;

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: 'Fake adrien',
      },
    };

    fetch(url, fetchOptions);

    fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Fake adrien',
      },
    };

    response = await fetch(url, fetchOptions);
    data = await response.json();

    assert.ok(
      data.plagiarismConcern,
      'Cool it\'s on true',
    );
  },
);

QUnit.test(
  'Test of fake authentication',
  async (assert) => {
    const url = 'https://sums-dev.jacek.cz/api/ongoing-cohorts';
    let response = await fetch(url);
    assert.ok(
      !response.ok,
      'GET on /api/ongoing-cohort is not OK without auth.',
    );

    const fetchOptions = {
      method: 'GET',
      headers: { Authorization: 'Fake adrien' }, // headers: { Authorization: 'Fake drien' }  don't forget the bug with that !
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
    const url = 'https://sums-dev.jacek.cz/api/1997PJS40/3/axel@fake.example.org';
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
    console.log('cohort : ');
    console.log(data.project.cohort);
    let versionNumber = data.version;
    console.log('version : ' + versionNumber);
    console.log(createMarkingsFromData(data));

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      Authorization: 'Fake axel',
    };
    response = await fetch(url, fetchOptions);
    console.log('response : ');
    console.log(response);
    console.log('response.text : ');
    console.log(response.text);
    console.log('response.json : ');
    console.log(response.json());
    let returnVersion = response.text;

    console.log(returnVersion);

    // ******************CONFLICT TEST******************
    /* data.version -= 1;

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      Authorization: 'Fake axel',
    };
    try {
      response = null;
      response = await fetch(url, fetchOptions);
      console.log(await response);
      assert.ok(false, 'There should be a Conflict exception.');
    } catch (e) {
      console.log(e);
      assert.ok(true, 'Exception thrown.');
    } */

    // is there a way to guess what the new version number should be ? time function etc ?
    // promise on return ???
  },
);
