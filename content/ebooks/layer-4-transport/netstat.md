`netstat` lists every socket on a machine: what is listening, what is connected to where, the state of each connection and, with the right flag, which program owns it. It is the quickest way to answer "is this service even running?"

## The flags you need on Windows

```bat
netstat -ano
```

- `-a` all sockets, including listening ones
- `-n` numbers, not names (much faster)
- `-o` the owning process ID (PID)

Add `-b` (in an administrator prompt) to see the program name directly.

## Reading the output

```text
  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING       4120
  TCP    192.168.1.20:51514     93.184.216.34:443      ESTABLISHED     7788
  TCP    192.168.1.20:51490     142.250.1.1:443        TIME_WAIT       0
  UDP    0.0.0.0:5353           *:*                                    2236
```

- **0.0.0.0** as a local address means "listening on every interface". **127.0.0.1** means local only, unreachable from other machines.
- `LISTENING`: a service waiting for connections.
- `ESTABLISHED`: a live connection.
- `TIME_WAIT`: recently closed; normal, and it clears on its own.
- `SYN_SENT` that never changes: this machine is trying to connect and getting no reply.
- `CLOSE_WAIT` piling up: the other side closed, but the local program never did. That is usually a bug in the program.

## Useful combinations

Is anything listening on port 3389?

```bat
netstat -ano | findstr :3389
```

Which program is PID 4120?

```bat
tasklist /fi "PID eq 4120"
```

Count connections by state:

```powershell
Get-NetTCPConnection | Group-Object State | Select Name, Count
```

## On Linux

`ss` has replaced netstat:

```bash
ss -tlnp      # TCP listening sockets, with the process
ss -tunap     # all TCP and UDP sockets
```

## Typical support uses

- **"The app can't connect to the server":** on the server, check the service is `LISTENING` on the expected port and not just on 127.0.0.1.
- **"Port already in use":** find the PID holding it and decide whether to stop it.
- **A PC talking to strange addresses:** list `ESTABLISHED` connections with their PIDs and identify each program.
