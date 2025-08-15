import { jest } from '@jest/globals';

import { compose, curry, lens, lensFn, memoise, tap } from './index.js';

describe('FP Library', () => {
  describe('Compose', () => {
    it('can combine functions', () => {
      function plusNine(int) {
        return int + 9;
      }
      const timesTweleve = (int) => int * 12;

      const composedFn = compose(
        plusNine,
        timesTweleve,
        function minusSix(int) {
          return int - 6;
        },
        (int) => int / 3
      );
      expect(((2 + 9) * 12 - 6) / 3).toBe(42);
      expect(composedFn(2)).toBe(42);
    });

    it('can provide the identify function by default ', () => {
      const composedFn = compose();
      expect(composedFn(42)).toBe(42);
    });
  });

  describe('Curry', () => {
    function cube(x, y, z) {
      return x * y * z;
    }

    describe('with no predefined args', () => {
      const cube_ = curry(cube);

      it('can create a curried function that will accept, all args all at once', () => {
        expect(cube_(2, 3, 7)).toBe(42);
      });

      it('can create a curried function that will accept, an arg followed by last two', () => {
        expect(cube_(2)(3, 7)).toBe(42);
        const cube_one = cube_(2);
        expect(cube_one(3, 7)).toBe(42);
      });

      it('can create a curried function that will accept, two args then last', () => {
        expect(cube_(2, 3)(7)).toBe(42);
        const cube_two = cube_(2, 3);
        expect(cube_two(7)).toBe(42);
      });

      it('can create a curried function that will accept, all args one at a time', () => {
        expect(cube_(2)(3)(7)).toBe(42);
        const cube_one = cube_(2);
        const cube_two = cube_one(3);
        expect(cube_two(7)).toBe(42);
      });
    });

    describe('with a single argument', () => {
      const cube2_ = curry(cube, 2);

      it('can create a curried function that will accept, all remaining args at once', () => {
        expect(cube2_(3, 7)).toBe(42);
      });

      it('can create a curried function that will accept, remaining args in subsequent calls', () => {
        expect(cube2_(3)(7)).toBe(42);
      });
    });

    describe('with a couple of arguments', () => {
      const cube2_3_ = curry(cube, 2, 3);

      it('can create a curried function that will accept, the remaining arg in the subsequent call', () => {
        expect(cube2_3_(7)).toBe(42);
      });
    });
  });

  describe('Lens', () => {
    const testObjects = {
      nullTest: null,
      emptyObject: {},
      emptyArray: [],

      simpleObject: { a: 42 },
      nestedObject: { a: { b: 42 } },
      complexObject: { a: { 'b c': 42 } },
      arrayInObject: { a: [42] },

      simpleArray: [42],
      nestedArray: [[42]],
      objectInArray: [{ b: 42 }],
    };

    describe('with missing item', () => {
      it('can be managed in a null object', () => {
        const lookup = lens('a');
        expect(lookup(testObjects.nullTest)).not.toBeDefined();
      });

      it('can be managed in an object', () => {
        const lookup = lens('a');
        expect(lookup(testObjects.emptyObject)).not.toBeDefined();
      });

      it('can be managed in an object (indirect args)', () => {
        const lookup = lens('a', 'c');
        expect(lookup(testObjects.emptyObject)).not.toBeDefined();
      });

      it('can be managed in an object (direct args)', () => {
        const lookup = lens('a.c');
        expect(lookup(testObjects.emptyObject)).not.toBeDefined();
      });

      it('can be managed in an object (optional args)', () => {
        const lookup = lens('a?.c');
        expect(lookup(testObjects.emptyObject)).not.toBeDefined();
      });

      it('can be managed in an array', () => {
        const lookup = lens(0);
        expect(lookup(testObjects.emptyArray)).not.toBeDefined();
      });
    });
    describe('locate an object property', () => {
      it('can be managed in an object', () => {
        const lookup = lens('a');
        expect(lookup(testObjects.simpleObject)).toBe(42);
      });

      it('can be managed in an object of an object (individual property args)', () => {
        const lookup = lens('a', 'b');
        expect(lookup(testObjects.nestedObject)).toBe(42);
      });

      it('can be managed in an object of an object (mandatory property args)', () => {
        const lookup = lens('a.b');
        expect(lookup(testObjects.nestedObject)).toBe(42);
      });

      it('can be managed in an object of an object (mandatory property args) (indirect combined)', () => {
        const lookup = lens('a["b c"]');
        expect(lookup(testObjects.complexObject)).toBe(42);
      });

      it('can be managed in an object of an object (mandatory property args) (indirect separate)', () => {
        const lookup = lens('a', '"b c"');
        expect(lookup(testObjects.complexObject)).toBe(42);
      });

      it('can be managed in an object of an object (optional property args)', () => {
        const lookup = lens('a?.b');
        expect(lookup(testObjects.nestedObject)).toBe(42);
      });

      it('can be managed in an array of an object (args)', () => {
        const lookup = lens('a', 0);
        expect(lookup(testObjects.arrayInObject)).toBe(42);
      });

      it('can be managed in an array of an object (string)', () => {
        const lookup = lens('a[0]');
        expect(lookup(testObjects.arrayInObject)).toBe(42);
      });

      it('can be managed in an object of an object (optional array args)', () => {
        const lookup = lens('a?.[0]');
        expect(lookup(testObjects.arrayInObject)).toBe(42);
      });
    });

    describe('locate an element of an array', () => {
      it('can be managed in an array', () => {
        const lookup = lens(0);
        expect(lookup(testObjects.simpleArray)).toBe(42);
      });

      it('can be managed in an object of an array (args)', () => {
        const lookup = lens(0, 'b');
        expect(lookup(testObjects.objectInArray)).toBe(42);
      });

      it('can be managed in an array of an array (string)', () => {
        const lookup = lens('[0][0]');
        expect(lookup(testObjects.nestedArray)).toBe(42);
      });

      it('can be managed in an array of an array (indexes)', () => {
        const lookup = lens(0, 0);
        expect(lookup(testObjects.nestedArray)).toBe(42);
      });
    });
  });

  describe('Lens Function', () => {
    const testData = {
      alpha: 'Hello, World!',
    };
    const ident = (_) => _;

    it('does not execute the function when the property is undefined', () => {
      expect(lensFn(ident, 'beta')(testData)).not.toBeDefined();
    });

    it('does execute the function when the property is not undefined', () => {
      expect(lensFn(ident, 'alpha')(testData)).toBe('Hello, World!');
    });
  });

  describe('Memoise', () => {
    const mockDelayedCube = (x, y, z) => x * y * z;
    let delayedCube;

    beforeEach(() => {
      delayedCube = jest.fn(mockDelayedCube);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('can increase globalCount for each call (not memoised)', () => {
      const callDelayedCube = () => delayedCube(2, 3, 7);
      expect(delayedCube).toHaveBeenCalledTimes(0);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(1);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(2);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(3);
    });

    it('can increase globalCount just once for each call (memoised)', () => {
      const cache = new Map();
      const delayedCube_ = memoise(delayedCube, cache);
      const callDelayedCube = () => delayedCube_(2, 3, 7);
      expect(delayedCube).toHaveBeenCalledTimes(0);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(1);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(1);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(1);
    });

    it('can increase globalCount just once for each call (memoised, default cache)', () => {
      const delayedCube_ = memoise(delayedCube);
      const callDelayedCube = () => delayedCube_(2, 3, 7);
      expect(delayedCube).toHaveBeenCalledTimes(0);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(1);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(1);

      expect(callDelayedCube()).toBe(42);
      expect(delayedCube).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tap', () => {
    const testFn = (x) => (x < 40 ? x * 2 : null);

    it('will return the input if the function call returns null or undefined', () => {
      expect(tap(testFn)(42)).toBe(42);
    });

    it('will return the output of the function call if not null or undefined', () => {
      expect(tap(testFn)(21)).toBe(42);
    });
  });
});
