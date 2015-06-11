var sshClient = require('ssh2').Client;

exports.exec = function(sshInfo, cb){
  var conn = new sshClient();
  console.log(colors.cyan('connecting to', sshInfo.name, sshInfo.title + '(' + sshInfo.ip + ')', '...'));
  sshInfo.changeStatus('connecting');
  conn.on('ready', function(){
    var cmd = getCommand(sshInfo);
    conn.exec(cmd, function(err, stream){
      if(err) {
        console.log(colors.red('==ERROR==\n run command on ' + sshInfo.ip + ' error.\n command: ' + cmd, '\nerror: ', err));
        cb(err);
      }

      stream.on('close', function(code, single){
        console.log('before close error check');
        if(code !== 0 ){
          console.log(colors.red('execute at', sshInfo.ip, 'failed, code:', code, 'single:', single));
        }
        console.log('code: ', code);
        conn.end();
        // code === 0, mean run command successful
        cb(!code);
      }).stderr.on('data', function(data){
        console.log('stream.stderr.on.data:', data);
        conn.end();
        cb(data);
      });
    });
  }).connect({
    host: sshInfo.ip,
    port: sshInfo.sshPort,
    username: sshInfo.user,
    password: sshInfo.password
  });
};