/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./src/board.ts":
/*!**********************!*\
  !*** ./src/board.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Board": () => (/* binding */ Board),
/* harmony export */   "Cell": () => (/* binding */ Cell)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_1__);


class Board {
    constructor(boardSize) {
        this.boardSize = boardSize;
        this.state = { cells: [] };
        this.ee = new events__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
    }
    onUpdate(handler) {
        this.ee.addListener(Board.UPDATE_EVENT, (prevState) => handler(this.state, prevState));
    }
    restore(cells) {
        this.setState({ cells });
    }
    reset() {
        this.setState({ cells: [] });
    }
    move(axis, step) {
        var _a;
        const boardSize = this.boardSize;
        let hasMoved = false;
        const mtxBefore = this.getBoardMatrix();
        const mtx = this.getBoardMatrix();
        const mergedKeys = new Set();
        for (const { value: cell, x, y } of (0,_utils__WEBPACK_IMPORTED_MODULE_0__.matrixIterator)(mtx, axis, Math.sign(step) > 0)) {
            if (!cell)
                continue; // skip empty values
            const canMove = (pointer) => (Math.sign(step) > 0 ? pointer < boardSize - 1 : pointer > 0);
            const initialPointer = axis === "x" ? x : y;
            // Каждую непустую ячейку мы двигаем по оси, до тех пор пока:
            // - Доходим до края
            // - Доходим до ячейки с таким же значением (необходимо слить соседнии ячейки и пометить ее, тк складывать можно только 1 раз)
            for (let p = initialPointer; canMove(p); p += step) {
                const pos = axis === "x" ? { y, x: p } : { y: p, x };
                const sibPos = axis === "x" ? { y, x: p + step } : { y: p + step, x };
                const sibling = (_a = mtx[sibPos.y]) === null || _a === void 0 ? void 0 : _a[sibPos.x];
                if (sibling === null) {
                    // соседняя ячейка свободна - передвигаем текущую клетку
                    [mtx[pos.y][pos.x], mtx[sibPos.y][sibPos.x]] = [mtx[sibPos.y][sibPos.x], mtx[pos.y][pos.x]];
                    hasMoved = true;
                    continue;
                }
                if (sibling.value === cell.value && !mergedKeys.has(cell.key) && !mergedKeys.has(sibling.key)) {
                    // merge values (using sib cell) and mark it as merged
                    cell.doubleValue();
                    mtx[sibPos.y][sibPos.x] = cell;
                    mtx[pos.y][pos.x] = null;
                    mergedKeys.add(cell.key);
                    hasMoved = true;
                    break;
                }
                break;
            }
        }
        if (hasMoved) {
            // Конвертируем матрицу в массив ячеек и синхронизируем (координаты)
            const cells = Array.from((0,_utils__WEBPACK_IMPORTED_MODULE_0__.matrixIterator)(mtx))
                .filter(({ value }) => value !== null)
                .map(({ value, x, y }) => (value === null || value === void 0 ? void 0 : value.setCoords({ x, y }), value));
            this.setState({ cells });
        }
        return hasMoved;
    }
    setState(patch) {
        const prevState = this.state;
        this.state = Object.assign(Object.assign({}, prevState), patch);
        this.ee.emit(Board.UPDATE_EVENT, prevState);
    }
    getBoardMatrix() {
        var _a;
        const boardSize = this.boardSize;
        const cells = this.state.cells;
        const mtx = Array.from({ length: boardSize }).map(() => Array.from({ length: boardSize }));
        for (const x of (0,_utils__WEBPACK_IMPORTED_MODULE_0__.range)(mtx.length)) {
            for (const y of (0,_utils__WEBPACK_IMPORTED_MODULE_0__.range)(mtx.length)) {
                mtx[y][x] = (_a = cells.find((cell) => cell.x === x && cell.y === y)) !== null && _a !== void 0 ? _a : null;
            }
        }
        return mtx;
    }
    spawnCells(count) {
        const boardSize = this.boardSize;
        const cells = [...this.state.cells];
        const createSpawnCell = () => {
            const INITIAL_VALUE = 2;
            const filledIndexes = cells.map((cell) => (0,_utils__WEBPACK_IMPORTED_MODULE_0__.calcIndexByCoords)(cell.coords, boardSize));
            const randomIndex = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.randomize)(0, Math.pow(boardSize, 2) - 1, { exclude: filledIndexes });
            const coords = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.calcCoordsByIndex)(randomIndex, boardSize);
            return new Cell(coords, INITIAL_VALUE);
        };
        Array.from((0,_utils__WEBPACK_IMPORTED_MODULE_0__.range)(count)).forEach(() => cells.push(createSpawnCell()));
        this.setState({ cells });
    }
}
Board.UPDATE_EVENT = "STATE_CHANGED_EVENT";
class Cell {
    constructor(coords, value) {
        this.value = value;
        this.key = null;
        this.x = null;
        this.y = null;
        this.validateValue(value);
        this.x = coords.x;
        this.y = coords.y;
        this.key = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.generateId)();
    }
    doubleValue() {
        // @ts-ignore
        this.value = this.value * 2;
    }
    setCoords(coords) {
        // @ts-ignore
        this.x = coords.x;
        // @ts-ignore
        this.y = coords.y;
    }
    get coords() {
        return { x: this.x, y: this.y };
    }
    validateValue(value) {
        if (!(0,_utils__WEBPACK_IMPORTED_MODULE_0__.isPowerOfTwo)(value)) {
            throw TypeError("Value must be a power of 2");
        }
    }
}


/***/ }),

/***/ "./src/controller.ts":
/*!***************************!*\
  !*** ./src/controller.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Command": () => (/* binding */ Command),
/* harmony export */   "Controller": () => (/* binding */ Controller)
/* harmony export */ });
var Command;
(function (Command) {
    Command[Command["LEFT"] = 0] = "LEFT";
    Command[Command["UP"] = 1] = "UP";
    Command[Command["RIGHT"] = 2] = "RIGHT";
    Command[Command["DOWN"] = 3] = "DOWN";
})(Command || (Command = {}));
class Controller {
    constructor() {
        this.KEY_MAP = {
            w: Command.UP,
            ArrowUp: Command.UP,
            s: Command.DOWN,
            ArrowDown: Command.DOWN,
            a: Command.LEFT,
            ArrowLeft: Command.LEFT,
            d: Command.RIGHT,
            ArrowRight: Command.RIGHT,
        };
    }
    listenCommand(handler) {
        const keysUnsubscribe = this.keysListen(handler);
        const gestureUnsubscribe = this.gestureListen(handler);
        return {
            unsubscribe: () => {
                keysUnsubscribe();
                gestureUnsubscribe();
            },
        };
    }
    keysListen(handler) {
        const listener = (event) => {
            const controlledKey = this.KEY_MAP[event.key];
            if (controlledKey !== undefined)
                handler(controlledKey, event);
        };
        document.addEventListener("keydown", listener);
        return () => {
            document.removeEventListener("keydown", listener);
        };
    }
    gestureListen(handler) {
        let touchstartX = 0;
        let touchstartY = 0;
        const touchStartListener = (e) => {
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
        };
        const touchEndListener = (e) => {
            const touchendX = e.changedTouches[0].screenX;
            const touchendY = e.changedTouches[0].screenY;
            const diffX = Math.abs(touchendX - touchstartX);
            const diffY = Math.abs(touchendY - touchstartY);
            if (diffX < 10 && diffY < 10) {
                return;
            }
            if (diffX > diffY) {
                // horizontal swipe
                handler(touchendX < touchstartX ? Command.LEFT : Command.RIGHT, e);
            }
            else {
                // vertical swipe
                handler(touchendY < touchstartY ? Command.UP : Command.DOWN, e);
            }
            //
            e.preventDefault();
            e.returnValue = false;
            return false;
        };
        //         window.addEventListener('touchmove', this.preventDefault, {passive: false});
        // inner-slider.js -> componentWillUnmount()
        // window.removeEventListener('touchmove', this.preventDefault, {passive: false});
        // preventDefault = (e) => { if(this.state.swiping) { e.preventDefault(); e.returnValue = false; return false; } };
        document.addEventListener("touchstart", touchStartListener, { passive: true });
        document.addEventListener("touchend", touchEndListener, { passive: true });
        return () => {
            document.removeEventListener("touchstart", touchStartListener);
            document.removeEventListener("touchend", touchEndListener);
        };
    }
}


/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Game": () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _board__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./board */ "./src/board.ts");
/* harmony import */ var _controller__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./controller */ "./src/controller.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./storage */ "./src/storage.ts");
/* harmony import */ var _renderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./renderer */ "./src/renderer.ts");




class Game {
    constructor(cfg) {
        this.cfg = cfg;
    }
    bootstrap() {
        var _a;
        const persisted = _storage__WEBPACK_IMPORTED_MODULE_2__.Storage.load();
        const resetButton = document.getElementById("reset-button");
        const currentScoreValue = document.getElementById("current-score-value");
        const controller = new _controller__WEBPACK_IMPORTED_MODULE_1__.Controller();
        const renderer = new _renderer__WEBPACK_IMPORTED_MODULE_3__.Renderer(this.cfg.boardElement, this.cfg.boardSize);
        const board = new _board__WEBPACK_IMPORTED_MODULE_0__.Board((_a = persisted === null || persisted === void 0 ? void 0 : persisted.boardSize) !== null && _a !== void 0 ? _a : this.cfg.boardSize);
        const moveHandler = {
            [_controller__WEBPACK_IMPORTED_MODULE_1__.Command.UP]: () => board.move("y", -1),
            [_controller__WEBPACK_IMPORTED_MODULE_1__.Command.DOWN]: () => board.move("y", 1),
            [_controller__WEBPACK_IMPORTED_MODULE_1__.Command.LEFT]: () => board.move("x", -1),
            [_controller__WEBPACK_IMPORTED_MODULE_1__.Command.RIGHT]: () => board.move("x", 1),
        };
        board.onUpdate(({ cells }) => {
            const score = cells.reduce((acc, cell) => acc + cell.value, 0);
            currentScoreValue.innerHTML = String(score);
            renderer.render(cells);
            if (this.isGameOver(cells)) {
                setTimeout(() => {
                    // wait animation
                    alert("Game Over!");
                    board.reset();
                    board.spawnCells(2);
                }, 300);
                return;
            }
            if (this.isWin(cells)) {
                // wait animation
                setTimeout(() => {
                    alert("You won 🎉🎉🎉");
                    board.reset();
                    board.spawnCells(2);
                }, 300);
                return;
            }
            _storage__WEBPACK_IMPORTED_MODULE_2__.Storage.save({ cells, boardSize: this.cfg.boardSize });
        });
        resetButton.addEventListener("click", () => {
            board.reset();
            board.spawnCells(2);
        });
        controller.listenCommand((key) => {
            const move = moveHandler[key];
            const hasMoved = move();
            // spawn cell if has moved
            if (hasMoved)
                board.spawnCells(1);
        });
        if (persisted === null || persisted === void 0 ? void 0 : persisted.cells) {
            board.restore(persisted.cells);
        }
        else {
            board.reset();
            board.spawnCells(2);
        }
        renderer.mount();
    }
    isWin(cells) {
        const GOAL = 2048;
        return cells.some((cell) => cell.value === GOAL);
    }
    isGameOver(cells) {
        const getCoordsKey = (coords) => `${coords.x}x${coords.y}`;
        const noEmptyCells = cells.length === Math.pow(this.cfg.boardSize, 2);
        if (!noEmptyCells) {
            return false;
        }
        const cellsMap = cells.reduce((acc, cell) => ((acc[getCoordsKey(cell.coords)] = cell), acc), {});
        return cells.every((cell) => {
            const siblings = [
                cellsMap[getCoordsKey({ x: cell.x + 1, y: cell.y })],
                cellsMap[getCoordsKey({ x: cell.x - 1, y: cell.y })],
                cellsMap[getCoordsKey({ x: cell.x, y: cell.y + 1 })],
                cellsMap[getCoordsKey({ x: cell.x, y: cell.y - 1 })],
            ];
            return siblings.every((sib) => !sib || sib.value !== cell.value);
        });
    }
}


/***/ }),

/***/ "./src/renderer.ts":
/*!*************************!*\
  !*** ./src/renderer.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Renderer": () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");

/**
 * Отрисовка происходит в несколько этапов
 * Первоначально мы рисуем все клетки в обычном порядке, для каждой клетки мы должны хранить, атрибут с ее ключом
 * При перерисовке мы должны вычислить, изначальный порядок относительно каждой клетки, и применить transform, к тем чей
 * порядок изменился, а также обновить все значения (value etc)
 *
 * При перерисовке, мы также должны удалить неиспользуемые элементы
 */
class Renderer {
    constructor(boardElement, boardSize) {
        this.boardElement = boardElement;
        this.boardSize = boardSize;
        this.renderCleanup = [];
        this.boardGridElement = null;
        this.boardSceneElement = null;
        this.createHooks = () => {
            this.renderCleanup.forEach((cleanup) => cleanup());
            this.renderCleanup = [];
            // let transitionStarted = false;
            // const alreadyHandled = new Set<VoidFunction>();
            // const _beforeTransitionHandler = () => {
            //     transitionStarted = true;
            // };
            // this.boardSceneElement.addEventListener("transitionstart", _beforeTransitionHandler);
            // this.renderCleanup.push(() => this.boardSceneElement.removeEventListener("transitionstart", _beforeTransitionHandler));
            const afterTransition = (callback) => {
                // const handler = () => {
                //     if (!alreadyHandled.has(callback)) {
                //         callback();
                //         alreadyHandled.add(callback);
                //     }
                // };
                // if (!transitionStarted) {
                //     handler();
                //     return;
                // }
                const timerID = window.setTimeout(callback, Renderer.MOVE_TRANSITION_MS);
                this.renderCleanup.push(() => clearTimeout(timerID));
                // this.boardSceneElement.addEventListener("transitionend", handler);
                // this.boardSceneElement.addEventListener("transitioncancel", handler);
                // this.renderCleanup.push(
                //     () => this.boardSceneElement.removeEventListener("transitionend", handler),
                //     () => this.boardSceneElement.removeEventListener("transitioncancel", handler)
                // );
            };
            return { afterTransition };
        };
        this.boardGridElement = boardElement.querySelector(".board-grid");
        this.boardSceneElement = boardElement.querySelector(".board-scene");
    }
    static getCSSVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name);
    }
    static setCSSVar(name, value) {
        return document.documentElement.style.setProperty(name, value);
    }
    mount() {
        const cellSizeCSS = `calc(var(${Renderer.BOARD_SIZE_VAR}) / ${this.boardSize})`;
        const cellGapCSS = `calc(var(${Renderer.CELL_SIZE_VAR}) * 0.04) `;
        Renderer.setCSSVar(Renderer.CELL_SIZE_VAR, cellSizeCSS);
        Renderer.setCSSVar(Renderer.CELL_GAP_VAR, cellGapCSS);
        const createEmptyCell = () => {
            const element = document.createElement("div");
            element.classList.add("cell", "cell-empty");
            return element;
        };
        this.boardGridElement.replaceChildren(...Array.from((0,_utils__WEBPACK_IMPORTED_MODULE_0__.range)(Math.pow(this.boardSize, 2))).map(() => createEmptyCell()));
    }
    static createCellElement(cell) {
        return Renderer.updateCellElement(cell, document.createElement("div"), true);
    }
    static updateCellElement(cell, element, useAbsolute) {
        element.className = ""; // cleanup all classNames before
        element.classList.add("cell", "cell-filled", `cell-${cell.value}`);
        element.setAttribute("data-key", cell.key);
        const shiftStep = `calc(var(${Renderer.CELL_SIZE_VAR}) + var(${Renderer.CELL_GAP_VAR}) * 0.25)`;
        const xShift = `calc(${shiftStep} * ${cell.x})`;
        const yShift = `calc(${shiftStep} * ${cell.y})`;
        // if (useAbsolute) {
        //     element.style.transform = "";
        //     element.style.top = xShift;
        //     element.style.left = yShift;
        // } else {
        //     element.style.top = "";
        //     element.style.left = "";
        //     element.style.transform = `translate(${xShift}, ${yShift})`;
        // }
        element.style.transform = "";
        element.style.top = yShift;
        element.style.left = xShift;
        element.innerHTML = String(cell.value);
        return element;
    }
    getSceneCellElements() {
        return Array.from(this.boardElement.querySelectorAll(".board-scene .cell"));
    }
    render(cells) {
        const hooks = this.createHooks();
        const cellElements = this.getSceneCellElements();
        const currentKeys = new Set(cells.map((c) => c.key));
        const getDataKey = (el) => String(el.getAttribute("data-key"));
        const getElementByKey = (key) => cellElements.find((el) => getDataKey(el) === key);
        // const getCellByKey = (key: string) => cells.find((cell) => cell.key === key);
        if (!cellElements.length) {
            this.boardSceneElement.replaceChildren(...cells.map((cell) => Renderer.createCellElement(cell)));
            return;
        }
        // creating new cells and updating an existed
        for (const cell of cells) {
            const element = getElementByKey(cell.key);
            if (!element) {
                // create new element
                const newElement = Renderer.createCellElement(cell);
                // newElement.style.transform = "";
                // const shiftCSS = `calc(var(${Renderer.CELL_SIZE_VAR}) + var(${Renderer.CELL_GAP_VAR}) * 0.25)`;
                // newElement.style.top = `calc(${shiftCSS} * ${cell.x})`;
                // newElement.style.left = `calc(${shiftCSS} * ${cell.y})`;
                // newElement.classList.add('no-transition')
                // hooks.afterTransition(() => this.boardSceneElement.append(newElement));
                // this.boardSceneElement.append(newElement);
                // this.boardSceneElement.append(newElement);
                hooks.afterTransition(() => this.boardSceneElement.append(newElement));
                continue;
            }
            Renderer.updateCellElement(cell, element);
        }
        const removedElements = cellElements.filter((el) => !currentKeys.has(getDataKey(el)));
        for (const removedEl of removedElements) {
            // hooks.afterTransition(() => removedEl.remove());
            removedEl.remove();
        }
        // this.boardSceneElement.replaceChildren(...cells.map((cell) => Renderer.createCellElement(cell)));
        // cells.forEach((cell) => {
        // const key = cell.key;
        // const el = getElementByKey(key);
        // // Заменяем удаленные элементы на новые
        // if (!el) {
        //     // hack for animation
        //     const newEl = Renderer.createCellElement(cell);
        //     newEl.classList.add("no-appear", "cell-empty");
        //     insertChildAtIndex(this.boardElement, newEl, cell.position);
        //     let interrupted = false;
        //     setTimeout(() => !interrupted && newEl.replaceWith(Renderer.createCellElement(cell)), 100);
        //     this.cleanupCbsBeforeRerender.push(() => void (interrupted = true));
        //     return;
        // }
        // el.classList.forEach((className) => /cell-\d+/.test(className) && el!.classList.remove(className));
        // el.innerHTML = !cell.isEmpty() ? String(cell.value) : "";
        // if (cell.isEmpty()) {
        //     el.classList.remove("cell-filled");
        // } else {
        //     el.classList.add("cell-filled", `cell-${cell.value}`);
        // }
        // });
        // const cells = [..._cells].sort((a, b) => calcIndexByCoords(a.coords, this.boardSize) - calcIndexByCoords(b.coords, this.boardSize)); // sorted cells
        // this.cleanupCbsBeforeRerender.forEach((cb) => cb());
        // this.cleanupCbsBeforeRerender = [];
        // const relevantKeys = new Set(cells.map((cell) => cell.key));
        // const allCellElements = this.getAllCellElements();
        // const getDataKey = (el: HTMLElement) => String(el.getAttribute("data-key"));
        // const getElementByKey = (key: string) => allCellElements.find((el) => getDataKey(el) === key);
        // const getCellByKey = (key: string) => cells.find((cell) => cell.key === key);
        // if (allCellElements.length !== cells.length) {
        //     this.initialRender(cells);
        //     return;
        // }
        // // ! cleanup
        // // Этап, на котором удаляем неиспользуемые DOM элементы
        // // Это пустые клетки, на месте которых должны появиться новые значения
        // allCellElements.forEach((el) => {
        //     if (!relevantKeys.has(getDataKey(el))) {
        //         el.remove();
        //     }
        // });
        // // ! hydrate
        // // Этап, на котором мы синхронизируем данные с состоянием в DOM
        // // Здесь мы не меняем порядок DOM элементов, только актуализируем содержание ячейки по
        // // соответствующему ключу, или создаем новую, если ее нет в DOM
        // // ! animate
        // // Здесь мы должны на основе актуального дом дерева и состояния передвинуть клетки,
        // // используя css, так, чтобы все стало на свои места
        // this.getAllCellElements().forEach((el, viewPosition) => {
        //     const key = getDataKey(el);
        //     const cell = getCellByKey(key)!;
        //     const actualCoords = cell.coords;
        //     const viewCoords = calcCoordsByIndex(viewPosition, cell.boardsSize);
        //     const coordsDiff = {
        //         x: actualCoords.x - viewCoords.x,
        //         y: actualCoords.y - viewCoords.y,
        //     };
        //     const transforms: string[] = [];
        //     const makeTranslate = (axis: "X" | "Y", value: number) => {
        //         const outerSize = "calc(var(--cell-size) + var(--cell-gap) * 0.25)";
        //         return `translate${axis}(calc(${outerSize} * ${value}))`;
        //     };
        //     if (coordsDiff.x) {
        //         transforms.push(makeTranslate("X", coordsDiff.x));
        //     }
        //     if (coordsDiff.y) {
        //         transforms.push(makeTranslate("Y", coordsDiff.y));
        //     }
        //     el.style.transform = transforms.join(" ");
        // });
        // let processing = false;
        // const onTransitionFinished = () => {
        //     if (!processing) {
        //         processing = true;
        //         const children = this.getAllCellElements();
        //         const getPos = (el: HTMLElement) => getCellByKey(getDataKey(el))!.position;
        //         children.forEach((el) => {
        //             el.style.transform = "";
        //             el.classList.add("no-appear");
        //         });
        //         this.boardElement.replaceChildren(...children.sort((a, b) => getPos(a) - getPos(b)));
        //     }
        // };
        // this.boardElement.addEventListener("transitionend", onTransitionFinished);
        // // this.boardElement.addEventListener("transitioncancel", onTransitionFinished);
        // this.cleanupCbsBeforeRerender.push(
        //     () => this.boardElement.removeEventListener("transitionend", onTransitionFinished)
        //     // () => this.boardElement.removeEventListener("transitioncancel", onTransitionFinished)
        // );
    }
}
Renderer.CELL_GAP_VAR = "--cell-gap";
Renderer.CELL_SIZE_VAR = "--cell-size";
Renderer.BOARD_SIZE_VAR = "--board-size";
Renderer.MOVE_TRANSITION_MS = 100;


/***/ }),

/***/ "./src/storage.ts":
/*!************************!*\
  !*** ./src/storage.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Storage": () => (/* binding */ Storage)
/* harmony export */ });
/* harmony import */ var _board__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./board */ "./src/board.ts");

class Storage {
    static save(state) {
        var _a;
        const loaded = this.loadJson();
        localStorage.setItem(this.LS_KEY, JSON.stringify(Object.assign(Object.assign({}, loaded), { boardSize: state.boardSize, cells: (_a = state.cells) === null || _a === void 0 ? void 0 : _a.map(({ x, y, value }) => ({ x, y, value })) })));
    }
    static load() {
        var _a;
        const parsed = this.loadJson();
        if (!parsed) {
            return null;
        }
        return {
            boardSize: parsed.boardSize,
            cells: (_a = parsed.cells) === null || _a === void 0 ? void 0 : _a.map(({ x, y, value }) => new _board__WEBPACK_IMPORTED_MODULE_0__.Cell({ x, y }, value)),
        };
    }
    static loadJson() {
        try {
            return JSON.parse(localStorage.getItem(this.LS_KEY));
        }
        catch (_a) {
            return null;
        }
    }
}
Storage.LS_KEY = "game-state";


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "calcCoordsByIndex": () => (/* binding */ calcCoordsByIndex),
/* harmony export */   "calcIndexByCoords": () => (/* binding */ calcIndexByCoords),
/* harmony export */   "deepEqual": () => (/* binding */ deepEqual),
/* harmony export */   "generateId": () => (/* binding */ generateId),
/* harmony export */   "insertChildAtIndex": () => (/* binding */ insertChildAtIndex),
/* harmony export */   "isObject": () => (/* binding */ isObject),
/* harmony export */   "isPowerOfTwo": () => (/* binding */ isPowerOfTwo),
/* harmony export */   "matrixIterator": () => (/* binding */ matrixIterator),
/* harmony export */   "randomize": () => (/* binding */ randomize),
/* harmony export */   "range": () => (/* binding */ range)
/* harmony export */ });
const randomize = (min, max, cfg) => {
    const value = Math.floor(Math.random() * (max - min + 1) + min);
    if (!(cfg === null || cfg === void 0 ? void 0 : cfg.exclude.includes(value))) {
        return value;
    }
    return randomize(min, max, cfg);
};
const isPowerOfTwo = (value) => {
    return (Math.log(value) / Math.log(2)) % 1 === 0;
};
const range = function* (fromOrTo, to, step = 1) {
    let start = to !== undefined ? fromOrTo : 0;
    let end = to !== undefined ? to : fromOrTo;
    const reversed = Math.sign(step) < 0;
    if (reversed) {
        [start, end] = [end - 1, start - 1];
    }
    for (let i = start; reversed ? i > end : i < end; i += step) {
        yield i;
    }
};
/**
 * Генерирует короткий ID
 */
const generateId = () => "_" + Math.random().toString(36).slice(2, 9);
const insertChildAtIndex = (parent, child, index) => {
    if (!index)
        index = 0;
    if (index >= parent.children.length) {
        parent.appendChild(child);
    }
    else {
        parent.insertBefore(child, parent.children[index]);
    }
};
const calcCoordsByIndex = (index, boardSize) => {
    const x = index % boardSize;
    const y = Math.floor(index / boardSize);
    return { x, y };
};
const calcIndexByCoords = (coords, boardSize) => {
    return coords.x + coords.y * boardSize;
};
function* matrixIterator(matrix, pivotAxis = "x", reversed) {
    const size = matrix.length;
    for (const a1 of range(size)) {
        for (const a2 of range(0, size, reversed ? -1 : 1)) {
            const [x, y] = pivotAxis === "x" ? [a2, a1] : [a1, a2];
            const value = matrix[y][x];
            const index = calcIndexByCoords({ x, y }, size);
            yield { value, x, y, index };
        }
    }
}
const isObject = (value) => typeof value === "object" && value != null;
const deepEqual = (a, b) => {
    // P1
    if (typeof a !== typeof b) {
        return false;
    }
    if (Object.is(a, b)) {
        return true;
    }
    // P2
    if (!isObject(a) || !isObject(b)) {
        return false;
    }
    // P3
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }
    return keysA.every((key) => deepEqual(a[key], b[key]));
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/game.ts");

const boardElement = document.getElementById("board-root");
const scoreValueElement = document.getElementById("score-value");
const game = new _game__WEBPACK_IMPORTED_MODULE_0__.Game({
    scoreValueElement,
    boardElement,
    boardSize: 4,
});
game.bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map