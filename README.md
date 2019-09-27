# [meetingcostcalculator.ca](https://meetingcostcalculator.ca/)

## Ever wondered how much your team meetings cost?

The [Meeting Cost Calculator](https://meetingcostcalculator.ca/) lets you calculate an estimated cost for meetings, using the standard pay rates used by a variety of public sector organizations.

## Interested in ways of making your meetings more effective?

Take a look at [How to run an efficient meeting, from 18F](https://18f.gsa.gov/2016/12/14/how-to-run-an-efficient-meeting/), the [Apolitical Guide to Better Meetings](https://apolitical.co/solution_article/the-public-servants-guide-to-better-meetings/), or the [Freakonomics podcast titled How to Make Meetings Less Terrible](http://freakonomics.com/podcast/meetings/).

## How it works

The salary data included here is adapted from published annual pay rate sources, for example from the [TBS Rates of Pay website](https://www.tbs-sct.gc.ca/pubs_pol/hrpubs/coll_agre/rates-taux-eng.asp). 

You can [find and contribute to this data on GitHub](https://github.com/meetingcostcalculator/meeting-cost-calculator-data).

The data is converted from CSV files to JSON using the scripts in the [helpers repository](https://github.com/meetingcostcalculator/meeting-cost-calculator-helpers). The JS files for [organizations](https://github.com/meetingcostcalculator/meeting-cost-calculator-hugo-ca/blob/master/static/js/organizations.js) and [pay rates](https://github.com/meetingcostcalculator/meeting-cost-calculator-hugo-ca/blob/master/static/js/rates.js) are generated automatically from the [data repository CSV files](https://github.com/meetingcostcalculator/meeting-cost-calculator-data/tree/master/ca).

*   Meeting costs are determined by converting annual salaries into hourly rates, then multiplying these against the elapsed time.
*   Salary classifications with a range of levels are simplified to minimum, maximum, and median rates. These rates (along with optional employee benefit plan and accommodation premium costs) can be selected under the gear options menu.

## Local installation

To install a local version of the Meeting Cost Calculator:

1. Install Hugo by following the [Hugo installation instructions](https://gohugo.io/getting-started/installing/). For MacOS users, [Homebrew](https://brew.sh/) works well.

2. Clone this repository into your preferred location by using `git clone git@github.com:meetingcostcalculator/meeting-cost-calculator-data.git`

3. Switch into the new directory, and install the theme submodule using `git submodule update --remote --merge`

Then, run the Hugo development server using `hugo server -D`

You can learn more about how Hugo works by reading the [Getting Started documentation](https://gohugo.io/getting-started/).

## Credits

An [Ottawa Civic Tech project](http://ottawacivictech.ca/), built by [Sean Boots](https://twitter.com/sboots/). Thanks to Dan, Conor, Corey, David, Miceal, Rick, Mary Beth, Gordon, and Brandon for ideas and contributions!

This website is based on the [Vanilla Bootstrap Hugo Theme](https://github.com/zwbetz-gh/vanilla-bootstrap-hugo-theme). It uses [Bootstrap 4](https://getbootstrap.com/), the [Feather icon library](https://feathericons.com/), and [Netlify](https://www.netlify.com) for hosting.

This project is licensed under the [MIT license](https://github.com/meetingcostcalculator/meeting-cost-calculator-hugo-ca/blob/master/LICENSE).

## Feedback

Contributions, pull requests, and new issues are welcome! Please add new issues to the [original repository Issues tracker](https://github.com/sboots/meetingcostcalculator/issues).
