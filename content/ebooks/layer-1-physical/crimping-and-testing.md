A badly crimped plug is the cheapest fault in networking to create and one of the slowest to find. Done in the right order, a termination passes the tester first time.

## The six steps

1. **Strip** about 25 mm of the outer jacket. Score it gently; a nick in the inner insulation causes faults months later.
2. **Untwist** the pairs only as far as you need. Every millimetre of untwisted wire lets in more crosstalk.
3. **Order** the wires to your standard. For T568B: white-orange, orange, white-green, blue, white-blue, green, white-brown, brown.
4. **Trim** the wires straight across to about 13 mm, so they reach the front of the plug with the jacket still inside it.
5. **Insert** the wires with the clip facing down. Look through the end of the plug: each copper tip must touch the front wall.
6. **Crimp** firmly in one squeeze. The strain-relief wedge should grip the outer jacket, not bare wires.

> [!WARNING]
> If any coloured wire is visible outside the back of the plug, cut it off and start again. A plug that only holds the inner wires will work today and fail when someone moves the desk.

## Reading the tester

A basic tester has a main unit and a remote. It lights each pin in turn, one to eight, at both ends.

| What you see              | What it means                        | Fix                                      |
| ------------------------- | ------------------------------------ | ---------------------------------------- |
| 1 to 8 light in order     | Every pin is connected straight      | Done                                     |
| One number never lights   | **Open**: that wire is not connected | Re-terminate the end with the short wire |
| Two numbers light at once | **Short**: two wires touch           | Re-terminate; check for a crushed jacket |
| Lights out of order       | **Crossed** or wrong standard        | Compare both ends to the colour chart    |

A continuity tester cannot see a **split pair**. A certifier or qualification tester measures crosstalk and length as well, and is the tool to use on permanent cabling.

## A habit worth keeping

Test every cable you make before it leaves your hands, and label both ends. A two-second test at the bench saves an hour in the ceiling.
