DHCP (Dynamic Host Configuration Protocol) is why you can plug a laptop into any office port or join any Wi-Fi and simply be online. A server hands out an IP address and the other settings a device needs, for a limited time called the **lease**.

## DORA: four messages

1. **Discover:** the new device has no address, so it broadcasts: "is there a DHCP server?"
2. **Offer:** a server replies with an address it can lend, such as 192.168.1.50 for 24 hours.
3. **Request:** the device asks for that address (broadcast, so other servers know their offers were declined).
4. **Acknowledge:** the server confirms and sends the full settings.

Halfway through the lease, the device quietly asks the same server to renew it.

## What the server hands out

- IP address and subnet mask
- Default gateway
- DNS servers
- Lease time
- Optional extras, such as a domain name, NTP server, or the TFTP server for IP phones

## A scope on a Cisco router

```cisco
ip dhcp excluded-address 192.168.1.1 192.168.1.20
!
ip dhcp pool OFFICE
 network 192.168.1.0 255.255.255.0
 default-router 192.168.1.1
 dns-server 1.1.1.1 8.8.8.8
 lease 1
```

Exclude the addresses you give to routers, printers and servers by hand, so DHCP never lends them out.

```cisco
show ip dhcp binding
show ip dhcp pool
show ip dhcp conflict
```

## Across VLANs: the relay

Discover is a broadcast, and broadcasts stop at the router. If the DHCP server is on another subnet, the router must forward the requests:

```cisco
interface GigabitEthernet0/0.20
 ip helper-address 10.50.0.5
```

## Reservations

For a printer that must keep its address, create a reservation on the server tied to its MAC address. It still uses DHCP, but always receives the same address.

## On the client

```bat
ipconfig /all
ipconfig /release
ipconfig /renew
```

```bash
sudo dhclient -r && sudo dhclient
```

## When it goes wrong

| Symptom                       | Likely cause                                                                |
| ----------------------------- | --------------------------------------------------------------------------- |
| 169.254.x.x address           | No DHCP reply: cable, VLAN, relay or the server is down                     |
| Some users get no address     | The pool is full; shorten the lease or widen the scope                      |
| Address conflict warnings     | A static device inside the pool                                             |
| Devices get a strange gateway | A rogue DHCP server, such as a home router plugged in; enable DHCP snooping |
