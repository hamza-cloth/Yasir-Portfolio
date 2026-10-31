OSPF (Open Shortest Path First) lets routers find their neighbours, share a map of every link in the network and work out the best path themselves. When a link fails, they recalculate within seconds. Nobody has to edit a route.

## How it works

1. **Hellos:** routers on the same link send Hello packets every 10 seconds and become **neighbours** when the settings match.
2. **Adjacency:** neighbours exchange link-state advertisements (LSAs) until every router has the same database, the map.
3. **SPF:** each router runs Dijkstra's shortest-path algorithm on that map, with itself at the centre.
4. **Routes:** the best paths go into the routing table, marked `O`.

## Cost

OSPF's metric is **cost**, worked out from bandwidth: reference bandwidth divided by interface bandwidth. The default reference is 100 Mb/s, which makes 100 Mb/s, 1 Gb/s and 10 Gb/s all cost 1. Raise the reference on every router so fast links are told apart:

```cisco
router ospf 1
 auto-cost reference-bandwidth 10000
```

The path with the lowest total cost wins, even if it has more hops.

## A basic configuration

```cisco
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.3 area 0
 network 10.1.1.0 0.0.0.255 area 0
 passive-interface GigabitEthernet0/0
```

- The `network` statement uses a **wildcard mask**, the inverse of the subnet mask.
- `passive-interface` advertises the LAN without sending Hellos to the PCs on it.
- Small networks need only **area 0**. Larger ones add more areas, all joined to area 0.

## Checking it

```cisco
show ip ospf neighbor
show ip route ospf
show ip ospf interface brief
```

A healthy neighbour shows the state **FULL** (or `2WAY` between two non-designated routers on a shared segment).

## Neighbours that will not form

Both sides must agree on:

- Subnet and mask on the shared link
- Area number
- Hello and dead timers
- Authentication, if used
- MTU (otherwise they stick in `EXSTART`)

And each router needs a unique router ID.

> [!TIP]
> If a neighbour never appears, check `show ip ospf interface` on both ends first. Nine times in ten the area or the timers do not match.

## When it goes wrong

- **Neighbour stuck in INIT:** Hellos only work in one direction, often an ACL or a one-way link.
- **Route missing:** the network was never advertised, or the interface is passive on the wrong side.
- **Traffic over a slow link:** reference bandwidth is still the default, so the costs look equal.
