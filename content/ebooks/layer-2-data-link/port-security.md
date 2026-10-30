Anyone can walk up to a desk, unplug the PC and plug in their own laptop. **Port security** lets a switch port accept only the devices it should, and react when something else appears.

## What it controls

- **How many** MAC addresses may use the port (usually 1, or 2 for a phone with a PC behind it).
- **Which** addresses: typed in by hand, or learned automatically and remembered (**sticky**).
- **What happens** on a violation.

## Violation modes

| Mode       | Unknown frames | Logs it | Port stays up    |
| ---------- | -------------- | ------- | ---------------- |
| `protect`  | dropped        | no      | yes              |
| `restrict` | dropped        | yes     | yes              |
| `shutdown` | dropped        | yes     | no, err-disabled |

`shutdown` is the default and the safest: the port goes dark until someone checks it.

## A typical desk port

```cisco
interface GigabitEthernet0/5
 switchport mode access
 switchport access vlan 10
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
```

Port security only works on ports set statically to access or trunk mode, which is why the first line matters.

Check it:

```cisco
show port-security interface Gi0/5
show port-security address
```

## Bringing a port back

When a port is err-disabled, find out why first. If it was a genuine new PC, clear the old sticky address and re-enable the port:

```cisco
clear port-security sticky interface Gi0/5
interface GigabitEthernet0/5
 shutdown
 no shutdown
```

Or let ports recover on their own after a few minutes:

```cisco
errdisable recovery cause psecure-violation
errdisable recovery interval 300
```

> [!NOTE]
> Port security stops casual misuse, not a determined attacker, who can copy an allowed MAC address. For stronger control, use 802.1X, which checks a certificate or login before the port opens.

## When it goes wrong

- **"My new laptop doesn't work at my desk":** the port still remembers the old PC's sticky MAC.
- **A phone and PC on one port, one of them blocked:** raise `maximum` to 2.
- **Ports keep shutting at night:** a docking station or VM is presenting extra MAC addresses.
