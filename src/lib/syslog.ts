import { IST_TIME_ZONE } from "./ist-time";

// Lines in real Cisco IOS syslog format, using addresses from the CCNA practice labs.
export const SYSLOG_MESSAGES = [
  "%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up",
  "%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up",
  "%OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on GigabitEthernet0/1 from LOADING to FULL, Loading Done",
  "%SEC-6-IPACCESSLOGP: list GUEST-IN denied tcp 192.168.50.23(51544) -> 192.168.1.10(445), 1 packet",
  "%SYS-5-CONFIG_I: Configured from console by console",
  "%DHCPD-4-PING_CONFLICT: DHCP address conflict: server pinged 192.168.1.11.",
  "%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0.10, changed state to up",
  "%SEC-6-IPACCESSLOGP: list GUEST-IN permitted udp 192.168.50.41(53122) -> 8.8.8.8(53), 1 packet",
] as const;

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: IST_TIME_ZONE,
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatSyslogTimestamp(date: Date): string {
  const parts = Object.fromEntries(
    timestampFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const millis = String(date.getMilliseconds()).padStart(3, "0");
  return `*${parts.month} ${parts.day} ${parts.hour}:${parts.minute}:${parts.second}.${millis}`;
}

export function syslogLine(date: Date, message: string): string {
  return `${formatSyslogTimestamp(date)}: ${message}`;
}
