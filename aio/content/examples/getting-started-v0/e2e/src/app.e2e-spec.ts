'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Getting Started', () => {
  beforeEach(() => {
    return browser.get('/');
  });

  it('should display "My Store"', async() => {
    const title = await element(by.css('app-root app-top-bar h1')).getText();

    expect(title).toEqual('My Store');
  });
});
