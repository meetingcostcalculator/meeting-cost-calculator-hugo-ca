// JS for the Meeting Cost Calculator

var app = app || {};

app.organizations = {
  core: {
    name: "Core Public Service",
    hideDropdownLabels: 0,
    benefitFactor: 1.4
  },
  neb: {
    name: "National Energy Board",
    hideDropdownLabels: 0
  },
  cse: {
    name: "Communications Security Establishment",
    hideDropdownLabels: 0
  },
  csis: {
    name: "Canadian Security Intelligence Service",
    hideDropdownLabels: 0
  },
  caf: {
    name: "Canadian Armed Forces",
    hideDropdownLabels: 1,
    benefitFactor: 1.8
  }
};
