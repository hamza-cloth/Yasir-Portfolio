A switch decides where to send each frame by looking up its destination MAC address in a table. Nobody types that table in. The switch builds it by watching traffic.

## Learn, flood, forward, filter

1. **Learn:** when a frame arrives, the switch records its **source** MAC address against the port it came in on.
2. **Flood:** if the **destination** MAC is not in the table yet (or is the broadcast address), the switch sends the frame out of every port in that VLAN except the one it came from.
3. **Forward:** if the destination is known, the frame goes out of that one port only.
4. **Filter:** if the destination is on the same port the frame came in on, the switch drops it.

After the first reply, both devices are in the table and their traffic goes straight between their two ports.

## Reading the table

```cisco
show mac address-table
show mac address-table address 0050.56ab.12cd
show mac address-table interface GigabitEthernet0/5
```

| Vlan | Mac Address    | Type    | Ports  |
| ---- | -------------- | ------- | ------ |
| 10   | 0050.56ab.12cd | DYNAMIC | Gi0/5  |
| 10   | 00e0.4c68.0a11 | DYNAMIC | Gi0/24 |
| 20   | a4bb.6d10.77f2 | STATIC  | Gi0/9  |

A port with many MAC addresses behind it, like Gi0/24 often is, leads to another switch or an access point.

## Ageing

Dynamic entries expire after **300 seconds** without traffic, so the table follows devices that move or switch off.

## Finding a device on the network

This is one of the most useful support tricks. If you know a device's IP address:

1. Ping it, then run `arp -a` on a machine in the same subnet (or `show ip arp` on the gateway) to get its MAC address.
2. Run `show mac address-table address <mac>` on the core switch to see which port it is behind.
3. Follow that port to the next switch and repeat until you reach an access port with a single MAC. That is the desk.

## When it goes wrong

- **A MAC address flaps between two ports:** a loop, or the same device connected twice.
- **The table fills up and everything floods:** a MAC flooding attack or a faulty device. Port security limits how many addresses a port may learn.
