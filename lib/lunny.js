var npm = require('npm')
var path = require('path')
var pluginstall = require('pluginstall')
var readInstalled = require('read-installed')

module.exports = function(command, args, cb) {
  npm.load(function(err) {
    if (err) return cb(err)
    npm.commands[command](args, function errBack(err, data) {
      if (err) return cb(err)
      if (!command || ['install', 'uninstall'].indexOf(command) === false) return cb("invalid command")
      if (data.length > 0) checkInstalled(installedArrayToObject(data))
      else cb(false, "lunny installed 0 plugins")
    })  
  })
  
  function installedArrayToObject(installed) {
    return installed.reduce(function (l, r) {
      var parentDir = r[3]
        , parent = r[2]
        , where = r[1]
        , what = r[0]
        , from = r[4]
      l[from] = { parentDir: parentDir
                 , parent: parent
                 , children: []
                 , where: where
                 , what: what
                 , from: from }
      return l
    }, {})
  }

  function checkInstalled(packages) {
    var cwd = path.resolve(__dirname, '..')
    readInstalled(cwd, function (er, data) {
      Object.keys(data.dependencies).forEach(function eachDep(depName) {
        var dep = data.dependencies[depName]
        if (!packages[depName]) return
        if (!dep.cordova) return
        var depPlatform = getPlatform(dep)
        if (!depPlatform) return cb("lunny: no platform specified in plugin json")
        var pluginDir = path.resolve(packages[depName].where, '.')
        processPlugin(command, depPlatform, cwd, pluginDir)
      })
    })
  }
  
  function getPlatform(packageJson) {
    if (!packageJson.engines) return false
    if (packageJson.engines.android) return "android"
    if (packageJson.engines.ios) return "ios"
    return false
  }

  function processPlugin(action, platform, projectDir, pluginDir) {
    config = pluginstall.init(platform, projectDir, pluginDir)
    plugin = pluginstall.parseXml(config)

    pluginstall[action + "Plugin"](config, plugin, function (err) {
      if (err) console.error(err)
      else console.log('plugin ' + action + 'ed')
    })
  }
}
