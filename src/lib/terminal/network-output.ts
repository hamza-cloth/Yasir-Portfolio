// Simulated IOS output for R1 in the practice labs. No packets leave the browser.

export const SHOW_IP_INTERFACE_BRIEF = [
  "Interface              IP-Address      OK? Method Status                Protocol",
  "GigabitEthernet0/0     unassigned      YES unset  up                    up",
  "GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up",
  "GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up",
  "GigabitEthernet0/1     10.0.12.1       YES manual up                    up",
  "GigabitEthernet0/2     203.0.113.2     YES manual up                    up",
  "Loopback0              1.1.1.1         YES manual up                    up",
];

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

export function isIpv4(value: string): boolean {
  return IPV4.test(value);
}

export function pingOutput(host: string): string[] {
  return [
    "Type escape sequence to abort.",
    `Sending 5, 100-byte ICMP Echos to ${host}, timeout is 2 seconds:`,
    "!!!!!",
    "Success rate is 100 percent (5/5), round-trip min/avg/max = 18/21/27 ms",
  ];
}

export function tracerouteOutput(host: string): string[] {
  return [
    "Type escape sequence to abort.",
    `Tracing the route to ${host}`,
    "  1 192.168.10.1 1 msec 1 msec 1 msec",
    "  2 10.0.12.2 4 msec 3 msec 4 msec",
    "  3 203.0.113.1 9 msec 8 msec 9 msec",
    `  4 ${host} 21 msec 20 msec 22 msec`,
  ];
}

export const UNKNOWN_HOST = "% Unrecognized host or address, or protocol not running.";
