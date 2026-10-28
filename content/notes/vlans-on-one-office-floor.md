Picture one office floor with one switch. Staff laptops, a guest Wi-Fi access point and a printer all plug into it. Without VLANs they share one broadcast domain, so a guest can see the printer and every staff machine. VLANs split that single switch into separate networks without buying more hardware.

## The plan

| VLAN | Name            | Subnet          | Gateway      | Ports           |
| ---- | --------------- | --------------- | ------------ | --------------- |
| 10   | STAFF           | 192.168.10.0/24 | 192.168.10.1 | Fa0/1 – Fa0/12  |
| 20   | GUEST           | 192.168.20.0/24 | 192.168.20.1 | Fa0/13 – Fa0/20 |
| —    | Trunk to router | —               | —            | Gi0/1           |

Each VLAN gets its own subnet. Traffic between them has to go through a router, which is where you decide what is allowed.

## Step 1: create the VLANs

```cisco
vlan 10
 name STAFF
vlan 20
 name GUEST
```

## Step 2: put access ports in the right VLAN

```cisco
interface range fa0/1 - 12
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
!
interface range fa0/13 - 20
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
```

`portfast` lets end devices start forwarding straight away instead of waiting for spanning tree. Only use it on ports that connect to end devices, never to another switch.

## Step 3: trunk the uplink to the router

A trunk carries several VLANs over one cable and tags each frame with its VLAN ID using 802.1Q.

```cisco
interface gi0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,20
```

> [!NOTE]
> On switches that support more than one trunk protocol, such as the Catalyst 3560, set `switchport trunk encapsulation dot1q` before `switchport mode trunk`.

## Step 4: route between VLANs (router-on-a-stick)

The router uses one physical interface with a subinterface per VLAN:

```cisco
interface g0/0
 no shutdown
!
interface g0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
!
interface g0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
```

Hosts in VLAN 10 use 192.168.10.1 as their gateway, and hosts in VLAN 20 use 192.168.20.1.

## Verify before you walk away

```cisco
show vlan brief
show interfaces trunk
show ip interface brief
```

- `show vlan brief`: every access port is listed under the right VLAN.
- `show interfaces trunk`: Gi0/1 is trunking, with VLANs 10 and 20 allowed and active.
- On the router, both subinterfaces are up/up.

Then ping from a staff laptop to its gateway, and from a staff laptop to a guest device. If the second ping works, routing works. Whether it _should_ work is a policy decision, made with an ACL on the router.

## Small habits that prevent big problems

- Shut unused ports and put them in an unused VLAN.
- Turn on port security on access ports, so a desk move with an unknown device is noticed.
- Keep the native VLAN off user traffic and the same on both ends of the trunk.

> [!TIP]
> When a user "has no internet" after a desk move, check which VLAN their new port is in before anything else.
