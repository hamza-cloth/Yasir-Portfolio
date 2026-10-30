Subnetting cuts one network into smaller ones. You do it to keep departments apart, to limit broadcasts and to stop wasting addresses. The trick that makes it quick is the **block size**.

## The block size

The block size is 256 minus the interesting octet of the mask, the one that is neither 255 nor 0.

| Prefix | Mask            | Block size | Usable hosts |
| ------ | --------------- | ---------- | ------------ |
| /24    | 255.255.255.0   | 256        | 254          |
| /25    | 255.255.255.128 | 128        | 126          |
| /26    | 255.255.255.192 | 64         | 62           |
| /27    | 255.255.255.224 | 32         | 30           |
| /28    | 255.255.255.240 | 16         | 14           |
| /29    | 255.255.255.248 | 8          | 6            |
| /30    | 255.255.255.252 | 4          | 2            |

Subnets start at multiples of the block size. For /26 that is .0, .64, .128 and .192.

## Which subnet is this address in?

Take 192.168.10.150/26. The block size is 64. The multiples of 64 are 0, 64, 128, 192. 150 falls between 128 and 192, so:

- Network: 192.168.10.128
- Broadcast: 192.168.10.191 (one less than the next block)
- Hosts: .129 to .190

## VLSM: sizes that fit

Variable Length Subnet Masking means each subnet gets the size it needs instead of all being equal. Say you have 192.168.10.0/24 and need:

| Need        | Hosts | Prefix | Subnet            |
| ----------- | ----- | ------ | ----------------- |
| Staff       | 100   | /25    | 192.168.10.0/25   |
| Guest Wi-Fi | 50    | /26    | 192.168.10.128/26 |
| Servers     | 20    | /27    | 192.168.10.192/27 |
| Printers    | 10    | /28    | 192.168.10.224/28 |
| Spare       |       | /28    | 192.168.10.240/28 |

> [!TIP]
> Always allocate the **largest** subnet first. Each block then starts on a clean boundary and nothing overlaps.

## A quick check before you deploy

- Does every subnet start on a multiple of its block size?
- Does each one end before the next one begins?
- Is there room to grow? A subnet that is 95% full today will be a problem next year.

## When it goes wrong

- **Overlapping subnets:** two routers both claim the same addresses and traffic goes to the wrong one.
- **A host on the network or broadcast address:** it cannot be used. Pick an address inside the host range.
- **Mask typed wrong on one device:** it disagrees with its neighbours about who is local.
