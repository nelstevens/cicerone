import "shiny";
import "jquery";
import Driver from "driver.js";
import "driver.js/dist/driver.min.css";

import "./custom.css";

let driver = [];
let highlighted;
let previous;
let has_next;

const on_next = (id) => {
  highlighted = driver[id].getHighlightedElement();
  previous = driver[id].getLastHighlightedElement();
  has_next = driver[id].hasNextStep();

  try {
    highlighted = highlighted.options.element.substr(1);
  } catch (err) {
    highlighted = null;
  }

  try {
    previous = previous.options.element.substr(1);
  } catch (err) {
    previous = null;
  }

  var data = {
    highlighted: highlighted,
    has_next: has_next,
    previous: highlighted,
    before_previous: previous,
  };

  Shiny.setInputValue(id + "_cicerone_next", data);
};

const on_previous = (id) => {
  highlighted = driver[id].getHighlightedElement();
  previous = driver[id].getLastHighlightedElement();
  has_next = driver[id].hasNextStep();

  try {
    highlighted = highlighted.options.element.substr(1);
  } catch (err) {
    highlighted = null;
  }

  try {
    previous = previous.options.element.substr(1);
  } catch (err) {
    previous = null;
  }

  var data = {
    highlighted: highlighted,
    has_next: has_next,
    previous: highlighted,
    before_previous: previous,
  };

  Shiny.setInputValue(id + "_cicerone_previous", data);
};

const make_previous = (id) => {
  return function () {
    return on_previous(id);
  };
};

const make_next = (id) => {
  return function () {
    return on_next(id);
  };
};

Shiny.addCustomMessageHandler("cicerone-init", function (opts) {
  debugger;
  var id = opts.globals.id;
  var next_func = make_next(id);
  var prev_func = make_previous(id);
  opts.globals.onNext = next_func;
  opts.globals.onPrevious = prev_func;
  opts.globals.onReset = function () {
    Shiny.setInputValue("cicerone_reset", true, { priority: "event" });
  };

  driver[id] = new Driver(opts.globals);

  opts.steps.forEach((step, index) => {
    if (opts.steps[index].tab_id) {
      opts.steps[index].onHighlightStarted = onHighlightTab({
        tab_id: step.tab_id,
        tab: step.tab,
      }).getFn;
    }

    if (opts.steps[index].onHighlighted) {
      opts.steps[index].onHighlighted = new Function(
        "return " + opts.steps[index].onHighlighted,
      )();
    }

    if (opts.steps[index].onHighlightStarted && !opts.steps[index].tab_id) {
      opts.steps[index].onHighlightStarted = new Function(
        "return " + opts.steps[index].onHighlightStarted,
      )();
    }

    if (opts.steps[index].onNext) {
      opts.steps[index].onNext = new Function(
        "return " + opts.steps[index].onNext,
      )();
    }
    
    if (opts.steps[index].onPrevious) {
      opts.steps[index].onPrevious = new Function(
        "return " + opts.steps[index].onPrevious,
      )();
    }
  });

  if (opts.steps) {
    driver[id].defineSteps(opts.steps);
  }
});

const onHighlightTab = ({ tab_id, tab }) => ({
  tab_id,
  tab,
  getFn(element) {
    var tabs = $("#" + this.tab_id);
    console.log(this.tab_id);
    Shiny.inputBindings.bindingNames["shiny.bootstrapTabInput"].binding
      .setValue(tabs, this.tab);
  },
});

Shiny.addCustomMessageHandler("cicerone-start", function (opts) {
  driver[opts.id].start(opts.step);
});

Shiny.addCustomMessageHandler("cicerone-reset", function (opts) {
  driver[opts.id].reset();
});

Shiny.addCustomMessageHandler("cicerone-next", function (opts) {
  driver[opts.id].moveNext();
});

Shiny.addCustomMessageHandler("cicerone-previous", function (opts) {
  driver[opts.id].movePrevious();
});

Shiny.addCustomMessageHandler("cicerone-highlight-man", function (opts) {
  driver[opts.id].highlight(opts);
});

Shiny.addCustomMessageHandler("cicerone-highlight", function (opts) {
  driver[opts.id].highlight(opts.el);
});
