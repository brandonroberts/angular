'use strict'; // necessary for es6 output in node

import { browser } from 'protractor';
import { logging } from 'selenium-webdriver';
import * as openClose from './open-close.po';
import * as statusSlider from './status-slider.po';
import * as toggle from './toggle.po';
import * as enterLeave from './enter-leave.po';
import * as auto from './auto.po';
import * as filterStagger from './filter-stagger.po';
import * as heroGroups from './hero-groups';
import { getLinkById, sleepFor } from './util';

describe('Animation Tests', () => {
  const openCloseHref = getLinkById('open-close');
  const statusSliderHref = getLinkById('status');
  const toggleHref = getLinkById('toggle');
  const enterLeaveHref = getLinkById('enter-leave');
  const autoHref = getLinkById('auto');
  const filterHref = getLinkById('heroes');
  const heroGroupsHref = getLinkById('hero-groups');

  beforeAll(() => {
    browser.get('');
  });

  describe('Open/Close Component', () => {

    beforeAll(async () => {
      await openCloseHref.click();
      sleepFor();
    });

    it('should be open', async () => {
      let text = await openClose.getComponentText();
      const toggleButton = openClose.getToggleButton();
      const container = openClose.getComponentContainer();

      if (text.includes('Closed')) {
        await toggleButton.click();
        sleepFor();
      }

      text = await openClose.getComponentText();
      const containerHeight = await container.getCssValue('height');

      expect(text).toContain('The box is now Open!');
      expect(containerHeight).toBe('200px');
    });

    it('should be closed', async () => {
      let text = await openClose.getComponentText();
      const toggleButton = openClose.getToggleButton();
      const container = openClose.getComponentContainer();

      if (text.includes('Open')) {
        await toggleButton.click();
        sleepFor();
      }

      text = await openClose.getComponentText();
      const containerHeight = await container.getCssValue('height');

      expect(text).toContain('The box is now Closed!');
      expect(containerHeight).toBe('100px');
    });

    it('should log animation events', async () => {
      const toggleButton = openClose.getToggleButton();
      const loggingCheckbox = openClose.getLoggingCheckbox();
      await loggingCheckbox.click();
      await toggleButton.click();

      const logs = await browser.manage().logs().get(logging.Type.BROWSER);

      const animationMessages = logs.filter(({ message }) => message.indexOf('Animation') !== -1 ? true : false);

      expect(animationMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Status Slider Component', () => {
    const activeColor = 'rgba(255, 165, 0, 1)';
    const inactiveColor = 'rgba(0, 0, 255, 1)';

    beforeAll(async () => {
      await statusSliderHref.click();
      sleepFor(2000);
    });

    it('should be inactive with an orange background', async () => {
      let text = await statusSlider.getComponentText();
      const toggleButton = statusSlider.getToggleButton();
      const container = statusSlider.getComponentContainer();

      if (text === 'Active') {
        await toggleButton.click();
        sleepFor(2000);
      }

      text = await statusSlider.getComponentText();
      const bgColor = await container.getCssValue('backgroundColor');

      expect(text).toBe('Inactive');
      expect(bgColor).toBe(inactiveColor);
    });

    it('should be active with a blue background', async () => {
      let text = await statusSlider.getComponentText();
      const toggleButton = statusSlider.getToggleButton();
      const container = statusSlider.getComponentContainer();

      if (text === 'Inactive') {
        await toggleButton.click();
        sleepFor(2000);
      }

      text = await statusSlider.getComponentText();
      const bgColor = await container.getCssValue('backgroundColor');

      expect(text).toBe('Active');
      expect(bgColor).toBe(activeColor);
    });
  });

  describe('Toggle Animations Component', () => {
    beforeAll(async () => {
      await toggleHref.click();
      sleepFor();
    });

    it('should disabled animations on the child element', async () => {
      const toggleButton = toggle.getToggleAnimationsButton();

      await toggleButton.click();

      const container = toggle.getComponentContainer();
      const cssClasses = await container.getAttribute('class');

      expect(cssClasses).toContain('ng-animate-disabled');
    });
  });

  describe('Enter/Leave Component', () => {
    beforeAll(async () => {
      await enterLeaveHref.click();
      sleepFor(100);
    });

    it('should attach a flyInOut trigger to the list of items', async () => {
      const heroesList = enterLeave.getHeroesList();
      const hero = heroesList.get(0);
      const cssClasses = await hero.getAttribute('class');
      const transform = await hero.getCssValue('transform');

      expect(cssClasses).toContain('ng-trigger-flyInOut');
      expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = enterLeave.getHeroesList();
      const total = await heroesList.count();
      const hero = heroesList.get(0);

      await hero.click();
      await sleepFor(100);
      const newTotal = await heroesList.count();

      expect(newTotal).toBeLessThan(total);
    });
  });

  describe('Auto Calculation Component', () => {
    beforeAll(async () => {
      await autoHref.click();
      sleepFor(0);
    });

    it('should attach a shrinkOut trigger to the list of items', async () => {
      const heroesList = auto.getHeroesList();
      const hero = heroesList.get(0);
      const cssClasses = await hero.getAttribute('class');

      expect(cssClasses).toContain('ng-trigger-shrinkOut');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = auto.getHeroesList();
      const total = await heroesList.count();
      const hero = heroesList.get(0);

      await hero.click();
      await sleepFor(250);
      const newTotal = await heroesList.count();

      expect(newTotal).toBeLessThan(total);
    });
  });

  describe('Filter/Stagger Component', () => {
    beforeAll(async () => {
      await filterHref.click();
      sleepFor();
    });

    it('should attach a filterAnimations trigger to the list container', async () => {
      const heroesList = filterStagger.getComponentContainer();
      const cssClasses = await heroesList.getAttribute('class');

      expect(cssClasses).toContain('ng-trigger-filterAnimation');
    });

    it('should filter down the list when a search is performed', async () => {
      const heroesList = filterStagger.getHeroesList();
      const total = await heroesList.count();
      const formInput = filterStagger.getFormInput();

      await formInput.sendKeys('Mag');
      await sleepFor(500);
      const newTotal = await heroesList.count();

      expect(newTotal).toBeLessThan(total);
      expect(newTotal).toBe(2);
    });
  });

  describe('Hero Groups Component', () => {
    beforeAll(async () => {
      await heroGroupsHref.click();
      sleepFor(300);
    });

    it('should attach a flyInOut trigger to the list of items', async () => {
      const heroesList = heroGroups.getHeroesList();
      const hero = heroesList.get(0);
      const cssClasses = await hero.getAttribute('class');
      const transform = await hero.getCssValue('transform');
      const opacity = await hero.getCssValue('opacity');

      expect(cssClasses).toContain('ng-trigger-flyInOut');
      expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
      expect(opacity).toBe('1');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = heroGroups.getHeroesList();
      const total = await heroesList.count();
      const hero = heroesList.get(0);

      await hero.click();
      await sleepFor(300);
      const newTotal = await heroesList.count();

      expect(newTotal).toBeLessThan(total);
    });
  });
});


