Structured cabling is the idea that a building's network should be wired once, neatly and to a plan, so that moving a desk means moving a patch cord, not pulling a new cable through the ceiling.

## The pieces, from desk to core

1. **Work area:** the PC and the short patch cord to the wall.
2. **Wall outlet:** a labelled jack, for example D-214.
3. **Horizontal cable:** the permanent run inside the wall or ceiling, from the outlet to the telecom room. It is solid-core copper and at most **90 m** long.
4. **Patch panel:** where every horizontal cable ends, one port per outlet, in the same order and with the same labels.
5. **Patch cord:** a short flexible cable from the panel port to a switch port.
6. **Backbone:** fibre or copper between the floor's telecom room (IDF) and the main room (MDF).

The 100 m limit for Ethernet is shared out as 90 m of permanent cable plus up to 10 m of patch cords at both ends together.

## Why the patch panel matters

Switches are replaced every few years. The cable in the walls should last twenty. The patch panel separates the two: the fixed cabling never touches the switch, so a failed switch port is fixed by moving one patch cord.

## Labels are part of the job

Use one scheme everywhere and put the same label on the outlet, the cable and the panel port.

```text
D-214     floor 2, room 14, outlet D
PP2-14    patch panel 2, port 14
Gi1/0/14  switch port it is patched to
```

Keep a simple sheet that maps outlet to panel port to switch port. When someone reports "the jack by the window is dead", you can go straight to the right port.

## When it goes wrong

- **Desk dead after a move:** the outlet is fine but nobody patched its panel port to the switch.
- **Intermittent errors on one desk:** the run is over length, or the cable was bent tighter than four times its own diameter.
- **Cable trays full of unlabelled cords:** label and trace now, before the next fault, not during it.
