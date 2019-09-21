// JS for the Meeting Cost Calculator

var app = app || {};

$(function() {
  app.meetingCost = {};
  app.meetingCost.participants = [];
  app.meetingCost.timeElapsedSeconds;
  app.meetingCost.timeElapsedMoment;

  app.meetingCost.isTimerRunning = false;
  app.meetingCost.previousTimerSeconds = 0;

  app.meetingCost.initialize = function() {
    console.log("Meeting cost calculator initialized.");

    $(".js-add-user").on("click", function(e) {
      app.meetingCost.addUser(e);
    });

    $(".chairs-map").on("click", ".js-remove-user", function(e) {
      app.meetingCost.removeUser(e);
    });

    $(".js-start-time").on("click", function(e) {
      app.meetingCost.startTime(e);
    });

    $(".js-stop-time").on("click", function(e) {
      app.meetingCost.stopTime(e);
    });
    $(".js-reset").on("click", function(e) {
      app.meetingCost.resetParticipants();
    });

    $(".js-reset-time").on("click", function(e) {
      app.meetingCost.resetTime();
    });

    $(".js-add-time").on("click", function(e) {
      var elem = $(e.currentTarget);
      var amount = $(elem).data("amount");
      var dateType = $(elem).data("date-type");

      app.meetingCost.addTime(amount, dateType);
    });

    $(".js-remove-time").on("click", function(e) {
      var elem = $(e.currentTarget);
      var amount = $(elem).data("amount");
      var dateType = $(elem).data("date-type");

      app.meetingCost.subtractTime(amount, dateType);
    });

    $(".js-set-time").on("click", function(e) {
      var elem = $(e.currentTarget);
      var amount = $(elem).data("amount");
      var dateType = $(elem).data("date-type");

      app.meetingCost.setTime(amount, dateType);
    });

    // Change organization, pay rate, or costing method
    $(".js-settings-menu").on("click", "button", function(e) {
      var elem = $(e.currentTarget);

      // console.log(elem);

      // Change organization
      if ($(elem).hasClass("js-change-organization")) {
        var organization = $(elem).data("organization");
        if (organization !== app.selectedOrganization) {
          app.meetingCost.changeOrganization(organization);
        }
      }

      if ($(elem).hasClass("js-change-rate")) {
        var rate = $(elem).data("rate");
        if (rate !== app.selectedRate) {
          // Update the calculated cost
          app.selectedRate = rate;
          app.meetingCost.recalculateCost();
        }
      }

      if ($(elem).hasClass("js-change-costing")) {
        var costing = $(elem).data("costing");
        if (costing !== app.selectedCosting) {
          // Update the selected costing model
          app.selectedCosting = costing;
          app.meetingCost.recalculateCost();
        }
      }

      // Update the settings menu
      app.meetingCost.updateSettingsMenu();
    });

    // Change rate
    $(".js-change-rate").on("click", function(e) {
      var elem = $(e.currentTarget);
      var rate = $(elem).data("rate");

      // If that organization is already selected, no action required:
      if (rate !== app.selectedRate) {
        // Update check icons
        $(".js-change-rate i").removeClass("fa-check");
        $(elem)
          .find("i")
          .addClass("fa-check");

        // Update the calculated cost
        app.selectedRate = rate;
        app.meetingCost.recalculateCost();
      }
    });

    // Prepare the Lodash templates
    app.meetingCost.chairContainerTemplate = _.template(
      $("#chairContainerTemplate").html()
    );

    app.meetingCost.ratesSelectTemplate = _.template(
      $("#ratesSelectTemplate").html()
    );

    app.meetingCost.settingsMenuTemplate = _.template(
      $("#settingsMenuTemplate").html()
    );

    // Set initial values for each setting:
    app.meetingCost.changeOrganization("core");
    app.selectedRate = "median";
    app.selectedCosting = "salary"; // For all costs, change this to "all"

    // Update the settings menu:
    app.meetingCost.updateSettingsMenu();

    // Initializes other re-resettable values
    app.meetingCost.resetTime();
    app.meetingCost.resetParticipants();

    // Set the default time to 1 hour
    // app.meetingCost.addTime(60, "minutes");

    // Initial run of the timer tick:
    _.delay(app.meetingCost.tick, 1000);
  };

  app.meetingCost.resetParticipants = function() {
    app.meetingCost.participants = [];

    app.meetingCost.updateTimeClock();

    $(".js-reset").prop("disabled", 1);

    app.meetingCost.renderChairs();
  };

  app.meetingCost.resetTime = function() {
    app.meetingCost.isTimerRunning = false;
    app.meetingCost.previousTimerSeconds = 0;

    app.meetingCost.timeElapsedSeconds = 0;

    app.meetingCost.timeElapsedMoment = moment.duration(0);

    app.meetingCost.updateTimeClock();
    // Initialize the start/stop buttons (essentially - disabling the "Stop" button while inactive)
    app.meetingCost.stopTime();

    $(".js-reset-time").prop("disabled", 1);
  };

  app.meetingCost.unReset = function() {
    $(".js-reset").prop("disabled", 0);
  };

  app.meetingCost.updateSettingsMenu = function() {
    $(".js-settings-menu").html(app.meetingCost.settingsMenuTemplate());

    // Refresh icons
    feather.replace();
  };

  app.meetingCost.changeOrganization = function(organization) {
    app.selectedOrganization = organization;

    $(".js-user-type-select").html(
      app.meetingCost.ratesSelectTemplate({
        rates: app.rates[app.selectedOrganization],
        organization: app.organizations[app.selectedOrganization]
      })
    );
  };

  // This calculates median rates (now that these are no longer stored ahead of time), as well as adds the benefit factor calculations:
  app.meetingCost.calculateUserCosts = function(
    selectedOrganization,
    rateData
  ) {
    var benefitFactor = _.get(
      app.organizations,
      selectedOrganization + ".benefitFactor",
      app.defaultBenefitFactor
    );
    // console.log(benefitFactor);

    // This converts string values to floats (by multiplying by 1.0) before adding them together to average them up:
    _.set(
      rateData,
      "median",
      (_.get(rateData, "min", 0) * 1.0 + _.get(rateData, "max", 0) * 1.0) / 2.0
    );

    // Set min, max, and median values that include the benefit factor, since these aren't stored in the source rates data
    // Uses Lodash's handy set and get functions:
    _.set(
      rateData,
      "minAll",
      _.round(_.get(rateData, "min", 0) * benefitFactor)
    );
    _.set(
      rateData,
      "medianAll",
      _.round(_.get(rateData, "median", 0) * benefitFactor)
    );
    _.set(
      rateData,
      "maxAll",
      _.round(_.get(rateData, "max", 0) * benefitFactor)
    );

    return rateData;
  };

  app.meetingCost.addUser = function() {
    var userType = $(".js-user-type-select").val();
    var rateData = _.find(app.rates[app.selectedOrganization], {
      label: userType
    });

    console.log("Adding user.");
    console.log(userType);
    console.log(rateData);

    // Don't add if it's the "Choose participants" option
    if (rateData) {
      rateData = app.meetingCost.calculateUserCosts(
        app.selectedOrganization,
        rateData
      );

      app.meetingCost.participants.push(rateData);
    } else {
      // $("#user-type").animateCss("shake");
      console.log("No user selected.");
    }

    app.meetingCost.recalculateCost();

    app.meetingCost.renderChairs();

    app.meetingCost.unReset();
  };

  app.meetingCost.removeUser = function(e) {
    var elem = $(e.currentTarget);
    var index = $(elem).attr("data-user-index");

    console.log("Deleting " + index);
    delete app.meetingCost.participants[index];

    // Clean out empty values
    app.meetingCost.participants = _.compact(app.meetingCost.participants);

    app.meetingCost.recalculateCost();

    app.meetingCost.renderChairs();
  };

  app.meetingCost.addTime = function(amount, dateType) {
    $(".js-reset-time").prop("disabled", 0);

    app.meetingCost.timeElapsedMoment.add(_.parseInt(amount), dateType);

    app.meetingCost.updateTimeClock();
  };
  app.meetingCost.subtractTime = function(amount, dateType) {
    app.meetingCost.timeElapsedMoment.subtract(_.parseInt(amount), dateType);

    // Avoid negative values
    if (app.meetingCost.timeElapsedMoment.as("seconds") < 0) {
      app.meetingCost.timeElapsedMoment = moment.duration(0);
      $(".js-reset-time").prop("disabled", 1);
    }

    app.meetingCost.updateTimeClock();
  };
  app.meetingCost.setTime = function(amount, dateType) {
    app.meetingCost.timeElapsedMoment = moment.duration(amount, dateType);

    app.meetingCost.updateTimeClock();

    if (_.parseInt(amount) !== 0) {
      $(".js-reset-time").prop("disabled", 0);
    }
  };

  // Runs once per second
  app.meetingCost.tick = function() {
    var newTickSeconds;
    var timeDifference;

    if (app.meetingCost.isTimerRunning) {
      newTickSeconds = moment().unix();

      // If the ticker is already in progress,
      // compare the total seconds to the previous time the
      // tick ran.
      // This helps with situations where eg. a smartphone
      // goes to sleep while the timer is running.
      // This way, when the tick resumes, it'll add the missing seconds.
      if (app.meetingCost.previousTimerSeconds) {
        timeDifference = newTickSeconds - app.meetingCost.previousTimerSeconds;
      } else {
        // First time use:
        timeDifference = 1;
      }

      // console.log('Ticking');
      // console.log(newTickSeconds);
      // console.log(timeDifference);

      app.meetingCost.previousTimerSeconds = newTickSeconds;

      app.meetingCost.addTime(timeDifference, "seconds");
    }

    // Run it again!
    _.delay(app.meetingCost.tick, 1000);
  };

  app.meetingCost.startTime = function(e) {
    app.meetingCost.isTimerRunning = true;

    $(".js-stop-time")
      .prop("disabled", 0)
      .show();
    $(".js-start-time")
      .prop("disabled", 1)
      .hide();

    $(".js-reset-time").prop("disabled", 0);
  };

  app.meetingCost.stopTime = function(e) {
    app.meetingCost.isTimerRunning = false;
    app.meetingCost.previousTimerSeconds = 0;

    $(".js-stop-time")
      .prop("disabled", 1)
      .hide();
    $(".js-start-time")
      .prop("disabled", 0)
      .show();
  };

  app.meetingCost.updateTimeClock = function() {
    // var timeClockString = app.meetingCost.timeElapsedMoment.hours() + ':' + app.meetingCost.timeElapsedMoment.minutes() + ':' + app.meetingCost.timeElapsedMoment.seconds();
    // var timeClockString = app.meetingCost.timeElapsedMoment.format('h:mm:ss');
    var timeClockString = numeral(
      app.meetingCost.timeElapsedMoment.format("s")
    ).format("00:00:00");

    $(".js-time-elapsed-input").val(timeClockString);

    app.meetingCost.recalculateCost();

    return timeClockString;
  };

  app.meetingCost.recalculateCost = function() {
    var annualValue = 0;
    var perSecondValue = 0;
    var newCost = 0;
    var newCostRounded = 0;

    // console.log('Calculating ' + app.selectedRate);

    _.each(app.meetingCost.participants, function(value, index) {
      if (app.selectedCosting === "all") {
        // The values with benefits etc. included are the same keywords with "All" added, e.g. minAll, medianAll, maxAll
        annualValue += _.parseInt(value[app.selectedRate + "All"]);
      } else {
        annualValue += _.parseInt(value[app.selectedRate]);
      }
    });

    // Convert from annual salary to per-hour cost, by dividing by 1950 (37.5  * 52)
    // Convert from per-hour to per-second cost, by dividing by 3600 (60 s * 60 min)

    newCost =
      (annualValue / 1950 / 3600) *
      app.meetingCost.timeElapsedMoment.format("s");

    // newCostRounded = _.parseInt(newCost * 100) / 100;

    $(".js-cost-display").text(numeral(newCost).format("$0,0.00"));

    return newCost;
  };

  app.meetingCost.renderChairs = function() {
    $(".chairs-map").html(app.meetingCost.chairContainerTemplate());
    // Re-render Feather icons
    feather.replace();
  };
});
