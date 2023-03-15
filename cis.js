// Version 1.1

const cfIPv4 = [
    '173.245.48.0/20',
    '103.21.244.0/22',
    '103.22.200.0/22',
    '103.31.4.0/22',
    '141.101.64.0/18',
    '108.162.192.0/18',
    '190.93.240.0/20',
    '188.114.96.0/20',
    '197.234.240.0/22',
    '198.41.128.0/17',
    '162.158.0.0/15',
    '104.16.0.0/13',
    '104.24.0.0/14',
    '172.64.0.0/13',
    '131.0.72.0/22'
  ];
  
  const urlParams = new URLSearchParams(window.location.search);
  
  var maxIP = urlParams.get('max')
  
  if (maxIP === null) {
    maxIP = 20
  } else {
    maxIP = parseInt(maxIP);
  }
  
  var ips = [];
  for (var cidr of cfIPv4) {
    ips = ips.concat(cidrToIpArray(cidr));
  }
  testIPs(randomizeElements(ips), maxIP)
  
  async function testIPs(ipList, maxIP) {
    const timeout = 2000;
    var testNo = 0;
    var numberOfWorkingIPs = 0;
    var validIPs = [];
    for (const ip of ipList) {
      testNo++;
      var testResult = 0;
      const url = `https://${ip}/__down`;
      const startTime = performance.now();
      const controller = new AbortController();
  
      for (const ch of ['', '|', '/', '-', '\\']) {
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);
        if (ch) {
          document.getElementById('searching').innerHTML = `<p dir="ltr" style="color: green">Test #${testNo}: ${ip} &nbsp; &nbsp; ${ch}</p>`;
        } else {
          document.getElementById('searching').innerHTML = `<p dir="ltr" style="color: red">Test #${testNo}: ${ip}</p>`;
        }
        try {
          const response = await fetch(url, {
            signal: controller.signal,
          });
  
          testResult++;
        } catch (error) {
          if (error.name === "AbortError") {
            //
          } else {
            testResult++;
          }
        }
        clearTimeout(timeoutId);
      }
  
      const duration = performance.now() - startTime;
  
      if (testResult === 5) {
        numberOfWorkingIPs++;
        validIPs.push({ip: ip, time: Math.floor(duration / 10) / 100});
        const sortedArr = validIPs.sort((a, b) => a.time - b.time);
        const tableRows = sortedArr.map(obj => `<tr><td>${obj.ip}</td><td>${obj.time}</td><tr>`).join('\n');
        document.getElementById('result').innerHTML = tableRows;
      }
  
      if (maxIP > 0 && numberOfWorkingIPs >= maxIP) {
        break;
      }
    }
    document.getElementById('searching').innerHTML = `<strong>DONE</strong>`;
  }
  
  
  function cidrToIpArray(cidr) {
    const parts = cidr.split('/');
    const ip = parts[0];
    const mask = parseInt(parts[1], 10);
    const ipParts = ip.split('.');
    const start = (
      (parseInt(ipParts[0], 10) << 24) |
      (parseInt(ipParts[1], 10) << 16) |
      (parseInt(ipParts[2], 10) << 8) |
      parseInt(ipParts[3], 10)
    ) >>> 0; // convert to unsigned int
    const end = (start | (0xffffffff >>> mask)) >>> 0; // convert to unsigned int
  
    const ips = [];
    for (let i = start; i <= end; i++) {
      const a = (i >> 24) & 0xff;
      const b = (i >> 16) & 0xff;
      const c = (i >> 8) & 0xff;
      const d = i & 0xff;
      ips.push(`${a}.${b}.${c}.${d}`);
    }
    return ips;
  }
  
  function randomizeElements(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
  }