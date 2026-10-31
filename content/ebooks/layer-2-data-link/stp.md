Good networks have backup links. But Ethernet frames have no time-to-live, so if switches are joined in a loop, a single broadcast circles forever, multiplies and takes the whole network down within seconds. That is a **broadcast storm**. The Spanning Tree Protocol keeps the backup cables plugged in and blocks just enough ports to break every loop.

## How STP decides

Switches exchange small messages called **BPDUs**.

1. **Elect a root bridge.** The switch with the lowest bridge ID wins. The bridge ID is a priority (32768 by default) followed by the MAC address, so on an untuned network the oldest switch often becomes root by accident.
2. **Pick a root port** on every other switch: the port with the lowest-cost path to the root.
3. **Pick a designated port** on every link: the side closer to the root forwards.
4. **Block everything else.** Those ports stay up but discard frames, ready to take over.

When a link fails, the blocked port moves to forwarding and traffic flows again.

## Choose your root

Make your core or distribution switch the root on purpose:

```cisco
spanning-tree mode rapid-pvst
spanning-tree vlan 10,20 root primary
```

Rapid PVST+ (802.1w) converges in a second or two instead of the 30 to 50 seconds of classic STP, and runs one tree per VLAN.

Check the result:

```cisco
show spanning-tree vlan 10
```

The output lists the root bridge, then each port with its role (Root, Desg, Altn) and state (FWD, BLK).

## Edge ports

Ports that connect to PCs and printers never create loops. Mark them as edge ports so they start forwarding immediately, and protect them in case someone plugs a switch in:

```cisco
interface range GigabitEthernet0/1 - 20
 spanning-tree portfast
 spanning-tree bpduguard enable
```

> [!TIP]
> "The PC takes 30 seconds to get an IP address after boot" is very often a port without PortFast. DHCP gives up before the port starts forwarding.

## When it goes wrong

- **Network crawls, switch lights flash solid:** a loop with STP disabled or a hub in the path. Unplug links until it stops, then find the loop.
- **Traffic takes a strange path:** the wrong switch is root. Set the priority deliberately.
- **A port is err-disabled:** BPDU Guard did its job; someone connected a switch to a desk port.
