'use strict';

/* global QUnit */

const fetch = require('node-fetch');

QUnit.module('Test of the data store');

QUnit.test(
  'GET /api/public/1999PJE40/criteria',
  async (assert) => {
    const url = 'https://sums.jacek.cz/api/public/1999PJE40/criteria';
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
    );/* no prizes for now ?
    assert.ok(
      Object.prototype.hasOwnProperty.call(data.markingForm, 'prizes'),
      'data.markingForm has a `prizes` attribute.',
    );
    assert.ok(
      Object.prototype.hasOwnProperty.call(data.markingForm, 'prizesUrl'),
      'data.markingForm has a `prizesUrl` attribute.',
    ); */
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
    // regexp ?

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
      const dataPath = data.markingForm.categories[i];
      const dataStr = 'data.markingForm.categories[' + i + '].';

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
        typeof (dataPath.compulsory),
        'boolean',
        dataStr + 'compulsory is a boolean.',
      );

      assert.equal(
        typeof (dataPath.description),
        'string',
        dataStr + 'description is a string.',
      );

      assert.equal(
        typeof (dataPath.name),
        'string',
        dataStr + 'name is a string.',
      );

      assert.equal(
        typeof (dataPath.weight),
        'number',
        dataStr + 'weight is a number.',
      );
      assert.ok(
        dataPath.weight > 0,
        dataStr + 'weight is positive.',
      );

      assert.ok(
        Array.isArray(dataPath.levels),
        dataStr + 'levels is an array.',
      );
      assert.ok(
        dataPath.levels.length > 0,
        dataStr + 'levels is not empty.',
      );

      let previousUpTo = 0;

      for (let i = 0; i < dataPath.levels.length; i += 1) {
        const newDataPath = dataPath.levels[i];
        const newDataStr = dataStr + 'levels[' + i + '].';

        assert.equal(
          typeof (newDataPath.negatives),
          'string',
          newDataStr + 'negatives is a string.',
        );

        assert.equal(
          typeof (newDataPath.positives),
          'string',
          newDataStr + 'positives is a string.',
        );

        assert.ok(
          newDataPath.positives !== '' || newDataPath.negatives !== '',
          newDataStr + 'positives and ' + newDataStr + 'negatives can\'t be empty at the same time.',
        );

        assert.equal(
          typeof (newDataPath.upTo),
          'number',
          newDataStr + 'upTo is a number.',
        );

        let isSuperior = false;

        // try {
        if (previousUpTo < newDataPath.upTo) {
          isSuperior = true;
        }
        previousUpTo = newDataPath.upTo;
        assert.ok(isSuperior, newDataStr + 'upTo works, it only increases.');
        // } catch (e) {
        //   assert.ok(false, newDataStr + 'The previous upTo is superior than the current.')
        // }

        assert.ok(
          newDataPath.upTo <= 100,
          newDataStr + 'upTo is lower than 100.',
        );
      }
    }
  },
);
