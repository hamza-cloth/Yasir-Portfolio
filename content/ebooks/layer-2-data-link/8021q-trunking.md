When VLANs span more than one switch, the link between the switches has to carry all of them. Rather than run one cable per VLAN, a **trunk** carries every VLAN over a single link and marks each frame with the VLAN it belongs to. The standard for that mark is **IEEE 802.1Q**.

## The tag

802.1Q inserts a 4-byte tag into the Ethernet frame, between the source MAC address and the EtherType. Inside it, 12 bits hold the **VLAN ID**, so a trunk can carry VLANs 1 to 4094.

1. A frame arrives untagged on an access port in VLAN 10.
2. The switch sends it out of the trunk **with a tag** saying VLAN 10.
3. The far switch reads the tag, removes it and delivers the frame only to ports in VLAN 10.

End devices never see the tag. Only switches, routers and servers configured for trunking do.

## The native VLAN

One VLAN on a trunk travels **untagged**: the native VLAN, VLAN 1 by default. Both ends must agree on it. A mismatch leaks frames between VLANs and Cisco switches will log a CDP native VLAN mismatch.

## Configuring a trunk

```cisco
interface GigabitEthernet0/24
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99
```

The first line is only needed on switches that also support the old ISL standard. Then check:

```cisco
show interfaces trunk
```

Look at three columns: the port is **trunking**, the native VLAN matches the other end, and your VLANs appear under "allowed and active".

> [!WARNING]
> Set ports to `switchport mode access` or `switchport mode trunk` on purpose. Leaving them to negotiate with DTP means a device that pretends to be a switch could form a trunk and see every VLAN.

## When it goes wrong

- **VLAN 20 works on one switch but not across the trunk:** VLAN 20 is missing from the allowed list, or was never created on the second switch.
- **Strange traffic in the wrong VLAN:** native VLAN mismatch between the two ends.
- **Trunk not forming:** one side is a static access port. Set both sides to trunk explicitly.
