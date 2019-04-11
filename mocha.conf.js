// source-map-support *must* be first in the file
require("source-map-support/register");

require("@babel/register")({
    retainLines: true
});

const chai = require("chai");
chai.should();

