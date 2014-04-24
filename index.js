var state = {
  rule: 110,
  size: 10,
  speed: 50,
  playing: false,
  initial: [0, 1, 0],
  iterationCount: 0
};

var onBackground = 'black';
var offBackground = 'white';

function toNumber (array) {
  return array.reduce(function (memo, el) {
    return (memo << 1) | el;
  }, 0);
}

// The heart of it all
function nextIteration (cells, rule) {
  var result = [];
  for (var i = -1; i < cells.length + 1; i++) {
    result.push((rule >> toNumber([
      cells[i - 1] || 0,
      cells[i] || 0,
      cells[i + 1] || 0
    ])) & 1);
  };
  return result;
}

jQuery(function ($) {
  var $window = $(window);
  var $document = $(document);
  var $htmlBody = $('html, body');
  
  var canvas = $('#iterations')[0];
  var ctx = canvas.getContext('2d');

  var automatonView = rivets.bind($('#automaton'), {
    state: state,
    controller: {
      clear: function () {
        state.iterationCount = 0;
        state.lastIteration = null;

        canvas.width = 0; canvas.height = 0;
      },
      initialChanged: function () {
        var $cell = $(this);
        var index = $cell.index();

        var initial = state.initial;
        initial[index] = +$cell.prop('checked');
        if (index === 0) { initial.unshift(0); }
        if (index === initial.length - 1) { initial.push(0); }

        while (initial.length > 2
          && !initial[0]
          && !initial[1]
        ) { initial.shift(); }

        while (initial.length > 2
          && !initial[initial.length - 1]
          && !initial[initial.length - 2]
        ) { initial.pop(); }

        automatonView.models.controller.clear();
      },
      next: function () {
        if (!state.lastIteration) {
          state.lastIteration = state.initial;
        } else {
          state.lastIteration = nextIteration(state.lastIteration, parseInt(state.rule))
        }
        state.iterationCount++;

        var atBottom = $document.scrollTop() === $document.height() - $window.height();

        // Resize canvas
        var oldWidth = canvas.width;
        var oldHeight = canvas.height;
        if (oldWidth && oldHeight) { var imageData = ctx.getImageData(0, 0, oldWidth, oldHeight); }
        canvas.height = state.iterationCount * state.size;
        canvas.width = state.lastIteration.length * state.size;
        if (oldWidth && oldHeight) { ctx.putImageData(imageData, state.size, 0); }

        // Render
        state.lastIteration.forEach(function (cell, i) {
          ctx.fillStyle = cell ? onBackground : offBackground;
          ctx.fillRect(i * state.size, (state.iterationCount - 1) * state.size, state.size, state.size);
        });

        if (atBottom) { $htmlBody.scrollTop($document.height()); }
      },
      pause: function () {
        clearTimeout(state.timeout);
        state.playing = false;
      },
      playPause: function () {
        if (!state.playing) {
          (function play () {
            automatonView.models.controller.next();
            state.timeout = setTimeout(play, 3300 / state.speed);
          }());
          state.playing = true;
        } else {
          automatonView.models.controller.pause();
        }
      },
      stop: function () {
        automatonView.models.controller.pause();
        automatonView.models.controller.clear();
      },
      preventDefault: function (evt) {
        evt.preventDefault();
      }
    }
  });
});
