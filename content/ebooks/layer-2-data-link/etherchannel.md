Two switches joined by four cables would normally have three of them blocked by spanning tree. **EtherChannel** bundles those links into one logical link, a **Port-channel**, so all four carry traffic and STP sees a single port.

## What you gain

- **Bandwidth:** four 1 Gb/s links give up to 4 Gb/s in total.
- **Resilience:** if one cable fails, traffic moves to the others in under a second, with no spanning tree recalculation.
- **Simplicity:** one interface to configure and monitor instead of four.

## Load balancing is per conversation

EtherChannel does not split a single file transfer across all links. It **hashes** each conversation, using fields such as source and destination MAC or IP addresses, and keeps that conversation on one member link. Many users spread nicely across the bundle; one big transfer still tops out at the speed of one link.

```cisco
port-channel load-balance src-dst-ip
```

## Building it with LACP

LACP (802.3ad) is the open standard. Both ends negotiate, and a miscabled link is left out instead of causing a loop.

```cisco
interface range GigabitEthernet1/0/1 - 4
 channel-group 1 mode active
!
interface Port-channel1
 switchport mode trunk
 switchport trunk allowed vlan 10,20,99
```

Use `active` on at least one side (`active` or `passive` on the other). Then check:

```cisco
show etherchannel summary
```

Look for `(SU)` on the Port-channel (layer 2, in use) and `(P)` on each member (bundled).

## The rule that matters

Every member port must match: same speed, same duplex, same mode (access or trunk), same allowed VLANs and same native VLAN. Configure the Port-channel interface, not the members, and the settings stay consistent.

## When it goes wrong

- **A member shows `(s)` or `(I)`:** suspended or standalone, usually a mismatch in speed, VLANs or LACP mode on the far end.
- **Bundle up but slower than expected:** traffic is between few hosts, so the hash puts it on one link. Try a different load-balance method.
- **Loop or err-disable when cabling:** one side was configured with `mode on` and the other was not. Prefer LACP.
