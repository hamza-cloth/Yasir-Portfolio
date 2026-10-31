When a computer will not start, guessing wastes time. Work from the bottom up: each layer of a machine only works if the one beneath it does, so the first layer that fails is where the fault is.

## 1. Power and cables

- Is the outlet live? Try a lamp or a phone charger.
- Is the power cable seated at both ends, and the PSU switch on?
- On a laptop, remove the charger (and the battery if it comes out), hold the power button for 30 seconds, then try again with the charger only.

## 2. POST

The **Power-On Self-Test** checks the CPU, memory and graphics before anything loads.

- No fans, no lights: back to power.
- Fans spin but no display, often with **beep codes** or a flashing LED: usually memory or graphics. Reseat the RAM and try one stick at a time.
- Look up the beep pattern for that make; it names the part.

## 3. Firmware and boot order

- The machine reaches the logo but says "no boot device": check in BIOS/UEFI that the drive is detected and first in the boot order.
- A drive that is not detected at all is a cable, a port or a failed drive.

## 4. Operating system

- It starts to load, then restarts or shows a blue screen: note the stop code.
- Try **Safe Mode**. If it works there, the fault is a driver or a startup program, not hardware.

## 5. Drivers and devices

Open Device Manager and look for warning icons.

```bat
devmgmt.msc
```

- A device with a yellow triangle needs its driver reinstalled or rolled back.
- If the problem started after an update, roll that driver back first.

## 6. Application

Only once the machine itself is healthy is it worth looking at the program that fails: reinstall it, clear its cache, read its logs.

> [!TIP]
> Change one thing at a time and write down what you changed. If you swap the RAM and the cable together and it works, you still do not know which one was faulty.

## Before you close the ticket

Tell the user what failed and what you did, in one sentence. If a part was replaced, note it against the asset so the next person sees the history.
