An IPv4 address is 32 bits, written as four numbers from 0 to 255 separated by dots: 192.168.10.25. On its own an address is half the story. The **subnet mask** says which part names the network and which part names the device on it.

## Network part and host part

With the mask 255.255.255.0, also written **/24**, the first 24 bits are the network and the last 8 are the host.

| Address 192.168.10.25 /24 | Value          |
| ------------------------- | -------------- |
| Network address           | 192.168.10.0   |
| First usable host         | 192.168.10.1   |
| Last usable host          | 192.168.10.254 |
| Broadcast address         | 192.168.10.255 |
| Usable hosts              | 254            |

Two devices with the same network part talk directly. Anything else goes to the **default gateway**, the router's address on this network.

## Ranges worth knowing

| Range          | Meaning                                         |
| -------------- | ----------------------------------------------- |
| 10.0.0.0/8     | Private                                         |
| 172.16.0.0/12  | Private (172.16.x.x to 172.31.x.x)              |
| 192.168.0.0/16 | Private                                         |
| 127.0.0.0/8    | Loopback: 127.0.0.1 is "this machine"           |
| 169.254.0.0/16 | Link-local: the device gave up waiting for DHCP |
| 100.64.0.0/10  | Carrier-grade NAT, used by some ISPs            |

Private addresses are free to use inside any network but are never routed on the internet; NAT translates them on the way out.

## Checking a machine

```bat
ipconfig /all
```

```bash
ip addr show
ip route
```

You are looking for four things: the address, the mask, the default gateway and the DNS servers. If any of them is missing or wrong, very little else will work.

## When it goes wrong

- **169.254.x.x:** DHCP failed. Check the cable, the VLAN and the DHCP server.
- **Right address, no gateway:** the device can reach its own subnet but nothing beyond.
- **Duplicate address warning:** two devices were given the same static address, or a static address sits inside the DHCP pool.
- **Wrong mask:** the device thinks a local neighbour is remote (or the reverse) and sends traffic the wrong way.
