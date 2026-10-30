An access control list is an ordered list of permit and deny rules that a router checks against each packet. It is the simplest way to say "guests may use the internet but not the server".

## The three rules of ACLs

1. **Top to bottom:** the router reads the lines in order.
2. **First match wins:** as soon as a line matches, the router acts and stops reading.
3. **Implicit deny:** every ACL ends with an invisible `deny any`. A packet that matches nothing is dropped.

So put specific lines first, general lines last, and remember to permit what should get through.

## Standard and extended

- **Standard** ACLs match only the source address. Place them close to the destination.
- **Extended** ACLs match source, destination, protocol and port. Place them close to the source, so unwanted traffic is dropped early.

## Example: keep guests off the server

Staff are 10.10.0.0/24, guests 10.20.0.0/24, and the server is 10.50.0.10.

```cisco
ip access-list extended GUEST-RULES
 remark guests may not reach the server
 deny   ip 10.20.0.0 0.0.0.255 host 10.50.0.10
 remark everything else from guests is allowed
 permit ip 10.20.0.0 0.0.0.255 any
!
interface GigabitEthernet0/1.20
 ip access-group GUEST-RULES in
```

Notes:

- The `0.0.0.255` is a wildcard mask: 0 means "must match", 255 means "any value".
- `host 10.50.0.10` is short for `10.50.0.10 0.0.0.0`.
- `in` checks packets as they arrive on the interface; `out` checks them as they leave.

## Checking it

```cisco
show access-lists
```

Each line shows a match counter. If a line you expect to match stays at zero, the traffic is not arriving where you think, or an earlier line is catching it.

> [!WARNING]
> Never apply a new ACL to the interface you are connected through without a permit for your own session. Test on a console, or use `reload in 5` as a safety net.

## When it goes wrong

- **Everything stopped after applying the ACL:** there is no permit line, so the implicit deny blocked it all.
- **The deny does nothing:** a broader permit above it matches first.
- **Return traffic is blocked:** ACLs are not stateful. Allow replies with `established` for TCP, or use a firewall.
