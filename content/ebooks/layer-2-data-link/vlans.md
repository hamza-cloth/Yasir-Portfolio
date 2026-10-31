A VLAN (virtual LAN) splits one physical switch into several separate networks. Devices in different VLANs behave as if they were plugged into different switches: they cannot see each other's broadcasts, and they cannot talk at all without a router or a layer 3 switch in between.

## Why bother

- **Security:** guests on Wi-Fi should not be able to reach the accounts PC.
- **Less noise:** broadcasts (ARP, DHCP) stay inside their own VLAN instead of reaching every device.
- **Order:** one switch can serve staff, guests, phones and cameras, each on its own network and subnet.

The usual rule is one VLAN, one subnet. VLAN 10 might be 10.10.10.0/24 and VLAN 20 10.20.20.0/24.

## Configuring access ports

An **access port** belongs to exactly one VLAN and carries untagged frames for an ordinary device.

```cisco
vlan 10
 name STAFF
vlan 20
 name GUEST
!
interface GigabitEthernet0/1
 switchport mode access
 switchport access vlan 10
!
interface GigabitEthernet0/9
 switchport mode access
 switchport access vlan 20
```

Check the result:

```cisco
show vlan brief
show interfaces Gi0/1 switchport
```

## Talking between VLANs

To let staff reach a shared printer in another VLAN, route between them: either a router with one sub-interface per VLAN ("router on a stick") or a layer 3 switch with an SVI per VLAN. Then use ACLs to decide which traffic is allowed across.

> [!TIP]
> Do not leave unused ports in VLAN 1. Put them in an unused "parking" VLAN and shut them down, so a stranger who plugs in gets nothing.

## When it goes wrong

- **A PC gets a 169.254 address after moving desks:** its new port is in the wrong VLAN, so it never reaches the right DHCP scope.
- **Two PCs in the same VLAN cannot talk across switches:** the link between the switches is not a trunk, or the trunk does not allow that VLAN.
- **Everything works except one device:** compare `show interfaces switchport` for its port with a port that works.
