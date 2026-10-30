A firewall decides which connections may pass between networks. Its rules usually look at source, destination, protocol and port, and are read top to bottom like an ACL. What makes a modern firewall different is that it is **stateful**.

## Stateful means it remembers

When an office PC opens a connection to a website, the firewall records it in a **state table**. The reply from the website matches that entry and is allowed back in automatically. You never write a rule for return traffic.

An unsolicited packet from the internet matches no entry, so it is checked against the inbound rules, and usually dropped.

## Default deny

Start from "block everything", then allow only what has a reason:

| #   | From     | To         | Service             | Action    |
| --- | -------- | ---------- | ------------------- | --------- |
| 1   | Internet | Web server | TCP 443             | Allow     |
| 2   | LAN      | Internet   | TCP 80, 443, UDP 53 | Allow     |
| 3   | Admin PC | Web server | TCP 22              | Allow     |
| 4   | Any      | Any        | Any                 | Deny, log |

Put public servers in a **DMZ**, a separate zone, so that if one is compromised it still cannot reach the LAN.

## Host firewalls

Every server and PC should also filter its own ports.

```powershell
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
Get-NetFirewallRule -Enabled True -Direction Inbound | Select DisplayName
```

```bash
sudo ufw default deny incoming
sudo ufw allow 22/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status numbered
```

> [!WARNING]
> On a remote Linux server, allow SSH **before** enabling the firewall, or you lock yourself out.

## Good habits

- Name every rule and add a comment saying who asked for it and why.
- Allow specific sources wherever you can; "any" is the last resort.
- Log denied traffic, and read the log when something new breaks.
- Review rules every few months and remove the ones nobody can explain.

## When it goes wrong

- **Works inside, not from outside:** the inbound rule or the port forward is missing.
- **Works by IP, not by name:** outbound DNS (UDP and TCP 53) is blocked.
- **One app fails after a firewall change:** check the deny log for its traffic; it often needs an extra port nobody wrote down.
