Subnetting looks like binary gymnastics until you notice that almost every question asks the same three things: where does this network start, where does it end, and how many hosts fit inside? This note answers all three with one trick: the block size.

## The block size trick

A prefix tells you how many bits belong to the network. Whatever is left belongs to hosts. In the octet where the prefix stops, the block size is `256 − mask value` for that octet.

| Prefix | Mask            | Interesting octet | Block size | Usable hosts |
| ------ | --------------- | ----------------- | ---------- | ------------ |
| /24    | 255.255.255.0   | 4th               | 256        | 254          |
| /25    | 255.255.255.128 | 4th               | 128        | 126          |
| /26    | 255.255.255.192 | 4th               | 64         | 62           |
| /27    | 255.255.255.224 | 4th               | 32         | 30           |
| /28    | 255.255.255.240 | 4th               | 16         | 14           |
| /29    | 255.255.255.248 | 4th               | 8          | 6            |
| /30    | 255.255.255.252 | 4th               | 4          | 2            |
| /20    | 255.255.240.0   | 3rd               | 16         | 4,094        |

Networks start on multiples of the block size. That is the whole trick.

## Worked example: 192.168.10.37/26

1. /26 means the mask is 255.255.255.192, so the interesting octet is the 4th and the block size is 256 − 192 = **64**.
2. Multiples of 64: 0, 64, 128, 192. The host value 37 sits in the block that starts at 0.
3. **Network:** 192.168.10.0
4. **Broadcast:** one less than the next block, so 192.168.10.63
5. **Usable hosts:** 192.168.10.1 to 192.168.10.62, which is 2⁶ − 2 = **62** hosts.
6. **Wildcard:** 255.255.255.255 − 255.255.255.192 = 0.0.0.63, the value ACLs and OSPF `network` statements use.

## Worked example: 172.16.40.200/20

Here the prefix stops in the 3rd octet.

1. /20 means the mask is 255.255.240.0. Block size in the 3rd octet: 256 − 240 = **16**.
2. Multiples of 16 in the 3rd octet: …, 32, 48, … The value 40 sits in the block that starts at 32.
3. **Network:** 172.16.32.0
4. **Broadcast:** 172.16.47.255 (the next block starts at 48)
5. **Usable hosts:** 172.16.32.1 to 172.16.47.254, which is 2¹² − 2 = **4,094** hosts.

> [!TIP]
> Write the block sizes 128, 64, 32, 16, 8, 4 once at the top of your exam sheet. You will use them in every question.

## VLSM: give each network only what it needs

Say you have 192.168.1.0/24 and need four networks: 60 hosts, 28 hosts, 12 hosts and a router-to-router link. Allocate the **largest first**, so every block starts on a clean boundary.

| Need           | Prefix | Block | Range                         |
| -------------- | ------ | ----- | ----------------------------- |
| 60 hosts       | /26    | 64    | 192.168.1.0 – 192.168.1.63    |
| 28 hosts       | /27    | 32    | 192.168.1.64 – 192.168.1.95   |
| 12 hosts       | /28    | 16    | 192.168.1.96 – 192.168.1.111  |
| 2 hosts (link) | /30    | 4     | 192.168.1.112 – 192.168.1.115 |

Everything from 192.168.1.116 upward is still free for later.

## The edge cases people forget

- **/31** has no network or broadcast address. RFC 3021 lets both addresses be used on a point-to-point link, so a /31 gives you exactly 2 usable addresses.
- **/32** is a single host. You will see it on loopbacks and in host routes.
- **/0** is "every address", the default route `0.0.0.0/0`.

> [!NOTE]
> The subnet calculator on the Labs page handles all of these, including /31 and /32, and shows the binary with the network bits highlighted.

## A quick self-check

Before you trust an answer, check three things: the network address is a multiple of the block size, the broadcast is one less than the next multiple, and usable hosts equal 2 to the power of host bits, minus 2. If all three agree, you are done.
