#!/usr/bin/env node
var lunny = require('../lib/lunny')
var argv = require('optimist')
  .usage('Usage: lunny [install|uninstall] [packageName(s)]')
  .wrap(80)
  .argv
var args = argv._
if (args.length < 1) throw 'Missing arguments.'
lunny(args[0], args.slice(1, args.length), function(err, resp) {
  console.log(err, resp)
})
