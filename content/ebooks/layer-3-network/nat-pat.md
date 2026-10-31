Private addresses such as 192.168.1.10 cannot travel on the internet. **NAT** (Network Address Translation) rewrites them to a public address as packets leave, and back again as replies arrive. **PAT** (Port Address Translation), also called NAT overload, goes further and lets hundreds of devices share a single public address by also changing the source port.

## What the router does

1. A PC sends a packet from 192.168.1.10, port 51000.
2. The router replaces the source with its public address and a free port: 203.0.113.5, port 62001.
3. It writes the pair into its **translation table**.
4. The reply comes back to 203.0.113.5:62001. The router looks it up and sends it to 192.168.1.10:51000.

The port is what tells two PCs' conversations apart, which is why one address is enough.

## Types of NAT

| Type        | Mapping                              | Typical use                     |
| ----------- | ------------------------------------ | ------------------------------- |
| Static NAT  | one private ↔ one public, permanent  | a server that must be reachable |
| Dynamic NAT | private → one from a pool of publics | rare today                      |
| PAT         | many private → one public + ports    | every home and office router    |

## Configuring PAT

```cisco
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside
!
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
```

## Port forwarding

To let the internet reach a server inside, map a public port to it with static NAT:

```cisco
ip nat inside source static tcp 192.168.1.20 443 203.0.113.5 443
```

## Checking it

```cisco
show ip nat translations
show ip nat statistics
```

Each line shows the inside local, inside global, outside local and outside global addresses. If translations appear but replies do not arrive, the problem is after the router.

> [!NOTE]
> NAT hides inside addresses, but it is not a firewall. Treat any port you forward as exposed to the whole internet.

## When it goes wrong

- **Internet works for nobody:** inside and outside are swapped on the interfaces, or the ACL does not match the LAN.
- **Port forward does not work from inside the office:** many routers do not "hairpin". Test from outside, or use internal DNS.
- **Games or VoIP struggle:** some protocols carry addresses inside the payload and need helpers or a different setup.
