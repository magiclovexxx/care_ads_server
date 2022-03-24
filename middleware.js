const exec = require('child_process').exec;
run = async () => {
    const openvpn = await exec(`openvpn --client --dev tun --proto tcp --remote th-bkk.prod.surfshark.com 1443 --resolv-retry infinite --remote-random --nobind --tun-mtu 1500 --tun-mtu-extra 32 --mssfix 1450 --persist-key --persist-tun --ping 15 --ping-restart 0 --ping-timer-rem --reneg-sec 0 --remote-cert-tls server --auth-user-pass login.info --verb 3 --pull --fast-io --cipher AES-256-CBC --auth SHA512 --ca cert.ca --key-direction 1 --tls-auth tls.key`);
    openvpn.stdout.on('data', (data) => {
        console.log(data);
    });
    openvpn.stderr.on('data', (data) => {
        console.error(data);
    });
};
run();