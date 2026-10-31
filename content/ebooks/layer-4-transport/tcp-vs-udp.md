Once a packet reaches the right machine, the transport layer gets it to the right program. There are two main ways to do that, and they make opposite trade-offs.

## TCP: reliable and ordered

TCP (Transmission Control Protocol) sets up a connection before sending anything, numbers every byte and expects the other side to acknowledge what it receives.

- **Connection:** a three-way handshake opens it, FINs close it.
- **Reliability:** anything not acknowledged in time is sent again.
- **Order:** data reaches the application in the order it was sent.
- **Flow and congestion control:** the sender slows down when the receiver or the network cannot keep up.

The cost is overhead and delay: a lost packet holds up everything behind it until it is resent.

## UDP: fast and simple

UDP (User Datagram Protocol) just sends datagrams. No handshake, no acknowledgements, no ordering, no resending. Its header is only 8 bytes against TCP's 20 or more.

If the application needs reliability, it builds its own. Many do, in lighter ways that suit them.

## Side by side

|              | TCP                                               | UDP                                                |
| ------------ | ------------------------------------------------- | -------------------------------------------------- |
| Connection   | Yes, handshake first                              | No                                                 |
| Delivery     | Guaranteed or error                               | Best effort                                        |
| Order        | Kept                                              | Not kept                                           |
| Speed        | Slower to start, steady                           | Immediate                                          |
| Typical uses | Web (HTTP/1.1, HTTP/2), email, SSH, file transfer | DNS, DHCP, VoIP, video calls, games, QUIC (HTTP/3) |

## Choosing

- If every byte must arrive and in order, such as a file, a web page or a database query, use **TCP**.
- If late data is worthless, such as a voice packet from half a second ago, use **UDP**: it is better to skip it than to wait.

HTTP/3 is a good example of the modern middle ground. It runs QUIC over UDP and adds its own reliability per stream, so one lost packet no longer stalls the whole page.

## Seeing it

```bat
netstat -ano -p tcp
netstat -ano -p udp
```

TCP sockets show states such as `ESTABLISHED` and `LISTENING`. UDP sockets have no state at all, because there is no connection.

## When it goes wrong

- **A UDP service "works sometimes":** a firewall allows TCP on that port but not UDP. DNS over UDP 53 is the classic case.
- **Video call choppy, downloads fine:** packet loss or jitter. TCP hides it by resending; real-time UDP cannot.
