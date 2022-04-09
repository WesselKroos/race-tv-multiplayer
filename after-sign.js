exports.default = async function(context) {

  // If we are not packaging for windows we don't sign here, just return
  if (context.packager.platform.name !== 'windows') {
    return;
  }

  // Make sure we don't leave an outdated electron.exe.sig laying about
  if (context.packager.appInfo.productFilename !== 'electron') {
    var fs = require("fs");
    var path = context.appOutDir + '/electron.exe.sig'
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }
  }

  // Sign the application package
  var spawnSync = require("child_process").spawnSync;
  var vmp = spawnSync('python', [
      '-m', 'castlabs_evs.vmp', 'sign-pkg', 'dist/win-unpacked'
    ],
    {
      stdio: 'inherit' 
    });

  if (vmp.status != 0) {
    throw new Error('vmp-resign.py failed with code: ' + vmp.status);
  }

}