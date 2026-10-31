A router only knows the networks it is directly connected to. To reach anything further away it needs a route. A **static route** is one you type in yourself: "to reach network X, send the packet to that next router".

## Reading a routing table

```cisco
show ip route
```

```text
C    10.1.1.0/24 is directly connected, GigabitEthernet0/0
C    10.0.12.0/30 is directly connected, GigabitEthernet0/1
S    10.2.2.0/24 [1/0] via 10.0.12.2
S*   0.0.0.0/0 [1/0] via 10.0.12.2
```

`C` is connected, `S` is static and `*` marks the default route. The numbers in brackets are the administrative distance and the metric.

## Adding routes

On R1, send traffic for R2's LAN to R2:

```cisco
ip route 10.2.2.0 255.255.255.0 10.0.12.2
```

On R2, the return route to R1's LAN, and a default route to the internet:

```cisco
ip route 10.1.1.0 255.255.255.0 10.0.12.1
ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

> [!WARNING]
> Every route needs a **return route**. If R1 knows how to reach 10.2.2.0 but R2 does not know how to get back to 10.1.1.0, pings leave and never come home. It looks exactly like a firewall problem.

## Longest match wins

When several routes match, the router picks the most specific one. A packet for 10.2.2.50 matches both 10.2.2.0/24 and 0.0.0.0/0; the /24 wins. The default route only catches what nothing else matches.

## Floating static routes

Give a backup route a higher administrative distance, and it is only used when the main route disappears:

```cisco
ip route 0.0.0.0 0.0.0.0 203.0.113.1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 200
```

## When to use static routes

- Small networks with one or two routers.
- A default route to the ISP.
- Stub networks with only one way in and out.

Once you have more than a handful of routers, or more than one path, a dynamic protocol such as OSPF is easier and recovers from failures by itself.

## When it goes wrong

- **Ping one way only:** missing return route.
- **Route in the config but not in the table:** the next hop is unreachable or its interface is down.
- **Traffic goes to the internet instead of a branch:** the specific route is missing, so the default route caught it.
